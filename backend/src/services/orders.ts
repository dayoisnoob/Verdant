import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { addressesTable, orderItemsTable, ordersTable } from '../models';
import { ApiError } from '../utils/apiResponse';
import { CartService } from './cart';
import { CouponService } from './coupon';
import { generateOrderNumber } from '../utils/helpers';

export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CreateOrderData {
  userId: string;
  items: CheckoutItem[];
  stripeSessionId: string;
  amount: number;
  subtotal: number;
  customerEmail?: string | null;
  shippingAddressId: string;
  discountAmount?: number;
  deliveryNotes?: string;
  shippingFee?: number;
}

export class OrderService {
  static async createOrder(data: CreateOrderData) {
    const orderNumber = generateOrderNumber();
    const shippingFee = data.shippingFee
      ? Math.round(data.shippingFee * 100)
      : null;

    const order = await db.transaction(async (tx) => {
      const [orderRecord] = await tx
        .insert(ordersTable)
        .values({
          userId: data.userId,
          orderNumber,
          stripeSessionId: data.stripeSessionId,
          status: 'paid',
          subtotalCents: data.subtotal,
          totalCents: data.amount,
          currency: 'usd',
          discountAmount: data.discountAmount ?? null,
          customerEmail: data.customerEmail ?? null,
          shippingAddressId: data.shippingAddressId ?? null,
          deliveryNotes: data.deliveryNotes ?? null,
          shippingFee,
        })
        .returning();

      if (!orderRecord) throw new Error('Failed to create order');

      await tx.insert(orderItemsTable).values(
        data.items.map((item) => ({
          orderId: orderRecord.id,
          productId: item.productId,
          productName: item.name,
          image: item.image,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.price * 100),
          totalPriceCents: Math.round(item.price * item.quantity * 100),
        }))
      );

      return orderRecord;
    });

    await CartService.clearCart(data.userId);
    await CouponService.removeCouponFromCart(data.userId);

    return order;
  }

  static async getOrders(userId: string, page: number = 1, limit: number = 10) {
    const parsedLimit = Number(limit) || 10;
    const parsedPage = Number(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const orders = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        status: ordersTable.status,
        subtotalCents: ordersTable.subtotalCents,
        totalCents: ordersTable.totalCents,
        createdAt: ordersTable.createdAt,
        totalCount: sql<number>`count(*) over()`,
      })
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(parsedLimit)
      .offset(offset);

    const orderIds = orders.map((o) => o.id);

    const items =
      orderIds.length > 0
        ? await db
            .select({
              id: orderItemsTable.id,
              orderId: orderItemsTable.orderId,
              productName: orderItemsTable.productName,
              productId: orderItemsTable.productId,
              quantity: orderItemsTable.quantity,
              image: orderItemsTable.image,
              unitPriceCents: orderItemsTable.unitPriceCents,
              totalPriceCents: orderItemsTable.totalPriceCents,
            })
            .from(orderItemsTable)
            .where(inArray(orderItemsTable.orderId, orderIds))
        : [];

    const allOrders = orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    }));

    const total = Number(orders[0]?.totalCount ?? 0);
    const pagination = {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };

    return { allOrders, pagination };
  }

  static async getOrderBySessionId(userId: string, sessionId: string) {
    const [order] = await db
      .select({ orderNumber: ordersTable.orderNumber })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.userId, userId),
          eq(ordersTable.stripeSessionId, sessionId)
        )
      )
      .limit(1);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order.orderNumber;
  }

  static async getOrderById(userId: string, orderId: string) {
    const [orderRecord] = await db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        orderNumber: ordersTable.orderNumber,
        stripeSessionId: ordersTable.stripeSessionId,
        status: ordersTable.status,
        subtotalCents: ordersTable.subtotalCents,
        totalCents: ordersTable.totalCents,
        discountAmount: ordersTable.discountAmount,
        currency: ordersTable.currency,
        customerEmail: ordersTable.customerEmail,
        createdAt: ordersTable.createdAt,
        deliveryNotes: ordersTable.deliveryNotes,
        shippingFee: ordersTable.shippingFee,
        shippingAddress: {
          firstName: addressesTable.firstName,
          lastName: addressesTable.lastName,
          streetAddress: addressesTable.streetAddress,
          state: addressesTable.state,
          phone1: addressesTable.phone1,
          phone2: addressesTable.phone2,
        },
      })
      .from(ordersTable)
      .leftJoin(
        addressesTable,
        eq(ordersTable.shippingAddressId, addressesTable.id)
      )
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
      .limit(1);

    if (!orderRecord) {
      throw new ApiError(404, 'Order not found');
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, orderId));

    return { order: { ...orderRecord, items } };
  }

  // static async updateOrderStatus(
  //   orderId: string,
  //   updateData: updateOrderInput
  // ) {
  //   const [order] = await db
  //     .select()
  //     .from(ordersTable)
  //     .where(eq(ordersTable.id, orderId));

  //   if (!order) {
  //     throw new ApiError(404, 'Order not found');
  //   }

  //   const [updated] = await db
  //     .update(ordersTable)
  //     .set({
  //       ...updateData,
  //       shippedAt: updateData.status === 'shipped' ? new Date() : undefined,
  //       deliveredAt: updateData.status === 'delivered' ? new Date() : undefined,
  //     })
  //     .where(eq(ordersTable.id, orderId))
  //     .returning();

  //   return { message: 'Order status updated successfully.', data: updated };
  // }
}
