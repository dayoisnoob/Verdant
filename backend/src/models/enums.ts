import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['customer', 'admin']);

export const orderStatusEnum = pgEnum('order_status', [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'paid',
  'processing',
  'delivered',
  'cancelled',
  'refunded',
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'percentage',
  'fixed',
]);
