import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { ordersTable } from './orders';
import { productsTable } from './products';

export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  image: varchar('image'),
  quantity: integer('quantity').notNull().default(1),
  unitPricePence: integer('unit_price_pence').notNull(),
  totalPricePence: integer('total_price_pence').notNull(),
});
