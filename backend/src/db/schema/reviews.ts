import {
  boolean,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { orderItemsTable } from './orderItems';
import { productsTable } from './products';
import { usersTable } from './users';

export const reviewsTable = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  orderItemId: uuid('order_item_id').references(() => orderItemsTable.id, {
    onDelete: 'set null',
  }),
  rating: smallint('rating'),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
