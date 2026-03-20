import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { addressesTable } from './addresses';
import { orderStatusEnum } from './enums';
import { usersTable } from './users';

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),

    stripeSessionId: text('stripe_session_id').notNull().unique(),
    stripePaymentIntent: text('stripe_payment_int'),

    status: orderStatusEnum('status').default('paid').notNull(),

    subtotalPence: integer('subtotal_pence').notNull(),
    totalPence: integer('total_pence').notNull(),
    discountAmount: integer('discount_amount').default(0),
    deliveryNotes: text('delivery_notes'),

    currency: text('currency').default('usd').notNull(),

    customerEmail: text('customer_email'),

    shippingAddressId: uuid('shipping_address_id').references(
      () => addressesTable.id,
      { onDelete: 'set null' }
    ),
    shippingFee: integer('shipping_fee'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    orderNumberIdx: index('order_number_idx').on(table.orderNumber),
    userIdIdx: index('user_id_idx').on(table.userId),
    sessionIdIdx: index('session_id_idx').on(table.stripeSessionId),
  })
);
