import { pgTable, uuid, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { usersTable } from '../models';

export const cartsTable = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .unique(),
  couponCode: text('coupon_code'),
  discount: integer('discount'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Cart = typeof cartsTable.$inferSelect;
export type NewCart = typeof cartsTable.$inferInsert;
