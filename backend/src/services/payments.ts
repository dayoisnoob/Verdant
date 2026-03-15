import { eq, sql } from 'drizzle-orm';
import type Stripe from 'stripe';
import { db } from '../config/db';
import { env } from '../config/env';
import { stripe } from '../lib/stripe';
import { couponRedemptionsTable } from '../models';
import { couponsTable } from '../models/coupons';
import { OrderService } from './orders';
import { logger } from '../config/pino';

export interface LineItems {
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId: string;
}

export class PaymentService {
  static async createCheckoutSession(
    userId: string,
    items: LineItems[],
    shippingFee: number,
    addressId: string,
    discount?: number,
    couponCode?: string,
    deliveryNotes?: string
  ) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: { productId: item.productId },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Delivery Fee', images: [], metadata: {} },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    const createStripeCoupon = async (
      discount: number,
      couponCode?: string
    ) => {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: 'usd',
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
        discount && discount > 0
          ? [
              {
                coupon: await createStripeCoupon(discount, couponCode),
              },
            ]
          : [],
      metadata: {
        userId,
        addressId: addressId ?? '',
        discount: discount?.toString() ?? '0',
        couponCode: couponCode ?? '',
        deliveryNotes: deliveryNotes ?? '',
        shippingFee: shippingFee,
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
          ? Math.round(Number(session.metadata?.discount) * 100)
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
              price: (item.price?.unit_amount ?? 0) / 100,
              image: product?.images?.[0] ?? '',
            };
          })
          .filter((item) => !!item.productId);

        const subtotal =
          items.reduce((sum, item) => sum + item.price * item.quantity, 0) *
          100;

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
