import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { cartsTable } from './cart';
import { productsTable } from './products';

export const cartItemsTable = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => cartsTable.id, { onDelete: 'cascade' }),

  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  slug: text('slug').notNull(),
  imageUrl: text('image_url').notNull(),
  unit: text('unit').notNull(),
  farm: text('farm').notNull(),
  isOrganic: boolean('is_organic').notNull().default(false),

  pricePence: integer('price_pence').notNull(),

  quantity: integer('quantity').notNull().default(1),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CartItem = typeof cartItemsTable.$inferSelect;
export type NewCartItem = typeof cartItemsTable.$inferInsert;
