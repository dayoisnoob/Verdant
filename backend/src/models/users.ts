import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { roleEnum } from './enums';

export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }),
    email: varchar('email', { length: 100 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').default('customer').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    lastLogin: timestamp('last_login'),

    passwordChangedAt: timestamp('password_changed_at'),

    refreshToken: text('refresh_token'),
    passwordResetToken: text('password_reset_token'),
    passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),
    emailVerifyToken: text('email_verify_token').unique(),
    emailVerifyTokenExpiry: timestamp('email_verify_token_expiry'),
    emailVerifyTokenSentAt: timestamp('email_verify_token_sent_at'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailidx: index('user_email_idx').on(table.email),
  })
);
