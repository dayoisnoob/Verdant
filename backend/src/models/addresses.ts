import { boolean, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const addressesTable = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 200 }).notNull(),
  lastName: varchar('last_name', { length: 200 }).notNull(),
  streetAddress: text('street_address').notNull(),
  phone1: varchar('phone1', { length: 255 }).notNull(),
  phone2: varchar('phone2'),
  state: varchar('state', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(true).notNull(),
});
