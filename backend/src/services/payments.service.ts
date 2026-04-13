import { eq, inArray, sql } from 'drizzle-orm';
import type Stripe from 'stripe';
import { db } from '../config/db';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { stripe } from '../config/stripe';
import {
  cartItemsTable,
  cartsTable,
  couponRedemptionsTable,
  productsTable,
} from '../db';
import { couponsTable } from '../db/schema/coupons';
import { ApiError } from '../utils/api-response';
import { CartService } from './cart.service';
import { OrderService } from './orders.service';

export interface LineItems {
  quantity: number;
  productId: string;
}

interface OutOfStockItems {
  id: string | undefined;
  name: string | undefined;
  image: string | undefined;
  issue: string;
}

export class PaymentService {
  static async createCheckoutSession(
    userId: string,
    addressId: string,
    couponCode?: string,
    deliveryNotes?: string
  ) {
    const cartItems = await db
      .select()
      .from(cartItemsTable)
      .innerJoin(cartsTable, eq(cartItemsTable.cartId, cartsTable.id))
      .where(eq(cartsTable.userId, userId));

    if (cartItems.length === 0) {
      throw new ApiError(400, 'Your cart is empty');
    }

    const productIds = cartItems.map((i) => i.cart_items.productId);
    const products = await db
      .select({ id: productsTable.id, inStock: productsTable.inStock })
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));

    const outOfStockItems: OutOfStockItems[] = [];

    cartItems.forEach((i) => {
      const product = products.find((p) => p.id === i.cart_items.productId);
      if (!product || !product.inStock) {
        outOfStockItems.push({
          id: i.cart_items.productId,
          name: i.cart_items.name,
          image: i.cart_items.imageUrl ?? '',
          issue: 'out_of_stock',
        });
      }
    });

    if (outOfStockItems.length > 0) {
      throw new ApiError(
        409,
        'Some items in your basket are no longer available',
        outOfStockItems
      );
    }

    const cartTotals = await CartService.getCartTotal(userId);
    const discountPence = cartTotals.discountPence;
    const deliveryPence = cartTotals.deliveryPence;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.map((item) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.cart_items.name,
            images: item.cart_items.imageUrl ? [item.cart_items.imageUrl] : [],
            metadata: { productId: item.cart_items.productId },
          },
          unit_amount: Math.round(+item.cart_items.pricePence),
        },
        quantity: item.cart_items.quantity,
      }));

    if (deliveryPence > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: { name: 'Delivery Fee', images: [], metadata: {} },
          unit_amount: deliveryPence,
        },
        quantity: 1,
      });
    }

    const createStripeCoupon = async (
      discountPence: number,
      couponCode?: string
    ) => {
      const coupon = await stripe.coupons.create({
        amount_off: discountPence,
        currency: 'gbp',
        duration: 'once',
        name: couponCode ?? 'Discount',
      });
      return coupon.id;
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      discounts:
        discountPence && discountPence > 0
          ? [
              {
                coupon: await createStripeCoupon(discountPence, couponCode),
              },
            ]
          : [],
      metadata: {
        userId,
        addressId: addressId ?? '',
        discount: discountPence?.toString() ?? '0',
        couponCode: couponCode ?? '',
        deliveryNotes: deliveryNotes ?? '',
        shippingFee: deliveryPence,
      },
      success_url: `${process.env.FRONTEND_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    return session.url;
  }

  static async handleWebhookEvent(rawBody: Buffer, signature: string) {
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET!,
        300
      );
    } catch (err) {
      throw new Error('Webhook signature verification failed');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        const addressId = session.metadata?.addressId;
        const discount = Number(session.metadata?.discount)
          ? Math.round(Number(session.metadata?.discount))
          : 0;
        const couponCode = session.metadata?.couponCode || null;
        const deliveryNotes = session.metadata?.deliveryNotes;
        const shippingFee = session.metadata?.shippingFee
          ? Number(session.metadata.shippingFee)
          : 0;

        if (!userId) throw new Error('Missing userId in session metadata');

        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          {
            limit: 100,
            expand: ['data.price.product'],
          }
        );

        const items = lineItems.data
          .map((item) => {
            const product = item.price?.product as Stripe.Product;
            return {
              productId: product?.metadata?.productId ?? '',
              name: item.description ?? '',
              quantity: item.quantity ?? 1,
              price: item.price?.unit_amount ?? 0,
              image: product?.images?.[0] ?? '',
            };
          })
          .filter((item) => !!item.productId);

        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        let order;

        try {
          order = await OrderService.createOrder({
            userId,
            items,
            stripeSessionId: session.id,
            subtotal,
            amount: session.amount_total ?? 0,
            customerEmail: session.customer_details?.email ?? null,
            shippingAddressId: addressId!,
            discountAmount: discount,
            deliveryNotes: deliveryNotes,
            shippingFee: shippingFee,
          });
          logger.info(order, 'order created:');
        } catch (err) {
          logger.error(err, 'createOrder failed:');
          throw err;
        }

        if (couponCode) {
          const [coupon] = await db
            .update(couponsTable)
            .set({ usedCount: sql`${couponsTable.usedCount} + 1` })
            .where(eq(couponsTable.code, couponCode.toUpperCase()))
            .returning();

          await db.insert(couponRedemptionsTable).values({
            couponId: coupon?.id as string,
            userId,
            orderId: order.id,
          });
        }
      }
    }

    return { type: event.type };
  }
}
