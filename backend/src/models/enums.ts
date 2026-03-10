import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['customer', 'admin']);
// export const productTypeEnum = pgEnum('product_type', ['physical', 'digital']);
// export const badgeEnum = pgEnum('badge', ['new', 'sale', 'hot', 'popular']);
export const orderStatusEnum = pgEnum('order_status', [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

// export const paymentStatusEnum = pgEnum('payment_status', [
//   'pending',
//   'succeeded',
//   'failed',
//   'refunded',
// ]);

export const discountTypeEnum = pgEnum('discount_type', [
  'percentage',
  'fixed',
]);
