import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { paymentStatusEnum } from './enums';
import { orderItemsTable } from './orderItems';

export const paymentsTable = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => orderItemsTable.id, { onDelete: 'cascade' }),
  stripePiId: varchar('stripe_pi_id'),
  stripeCustomerId: varchar('stripe_customer_id'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  paymentMethod: varchar('payment_method').notNull(),
  last4: varchar('last4', { length: 4 }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
