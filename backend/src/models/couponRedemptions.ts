import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { couponsTable } from './coupons';
import { usersTable } from './users';
import { ordersTable } from './orders';

export const couponRedemptionsTable = pgTable(
  'coupon_redemptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    couponId: uuid('coupon_id')
      .notNull()
      .references(() => couponsTable.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_coupon_redemptions_user_id').on(table.userId),
    index('idx_coupon_redemptions_coupon_id').on(table.couponId),
  ]
);
