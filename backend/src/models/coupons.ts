import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { discountTypeEnum } from './enums';

export const couponsTable = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  minOrderAmount: integer('min_order_amount'),
  usageLimit: integer('usage_limit'),
  perUserLimit: integer('per_user_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
