import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { productsTable } from './products';
import { usersTable } from './users';

export const wishlistsTable = pgTable(
  'wishlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueWishlist: unique().on(table.userId, table.productId),
  })
);
