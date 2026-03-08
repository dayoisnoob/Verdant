import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { productsTable } from './products';

export const inventoryTable = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  weightGrams: integer('weight_grams'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
