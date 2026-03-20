import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.ts';

export const passwordResetTokensTable = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  used: boolean('used').notNull().default(false),

  usedAt: timestamp('used_at', { withTimezone: true }),

  ipAddress: text('ip_address'),

  attempts: integer('attempts').notNull().default(0),
});
