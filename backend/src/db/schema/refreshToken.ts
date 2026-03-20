import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.ts';

export const refreshTokensTable = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    rotatedAt: timestamp('rotated_at', { withTimezone: true }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceId: varchar('device_id', { length: 255 }),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    tokenFamilyId: uuid('token_family_id').notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_refresh_tokens_user_id').on(table.userId),
    index('idx_refresh_tokens_family_id').on(table.tokenFamilyId),
    index('idx_refresh_tokens_token_hash').on(table.tokenHash),
  ]
);
