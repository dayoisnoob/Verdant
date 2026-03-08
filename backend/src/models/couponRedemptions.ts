import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { couponsTable } from './coupons';

export const couponRedemptionsTable = pgTable('coupon_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id')
    .notNull()
    .references(() => couponsTable.id),
  userId: uuid('user_id').notNull(),
  orderId: uuid('order_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
