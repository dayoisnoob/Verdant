import { and, eq, inArray, lt, or } from 'drizzle-orm';
import {
  cartItemsTable,
  cartsTable,
  passwordResetTokensTable,
  refreshTokensTable,
} from '../db';
import { logger } from '../config/logger';
import { db } from '../config/db';
import cron from 'node-cron';

const cleanExpiredRefreshTokens = async () => {
  try {
    const result = await db
      .delete(refreshTokensTable)
      .where(
        or(
          eq(refreshTokensTable.isRevoked, true),
          lt(refreshTokensTable.expiresAt, new Date())
        )
      )
      .returning({ id: refreshTokensTable.id });

    logger.info({ deleted: result.length }, 'Cleaned expired refresh tokens');
  } catch (err) {
    logger.error({ err }, 'Failed to clean refresh tokens');
  }
};

const cleanExpiredPasswordResetTokens = async () => {
  try {
    const result = await db
      .delete(passwordResetTokensTable)
      .where(
        or(
          eq(passwordResetTokensTable.used, true),
          lt(passwordResetTokensTable.expiresAt, new Date())
        )
      )
      .returning({ id: passwordResetTokensTable.id });

    logger.info(
      { deleted: result.length },
      'Cleaned expired password reset tokens'
    );
  } catch (err) {
    logger.error({ err }, 'Failed to clean password reset tokens');
  }
};

const cleanAbandonedCarts = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const emptyCarts = await db
      .select({ id: cartsTable.id })
      .from(cartsTable)
      .leftJoin(cartItemsTable, eq(cartItemsTable.cartId, cartsTable.id))
      .where(
        and(
          lt(cartsTable.updatedAt, thirtyDaysAgo),
          eq(cartItemsTable.id, null as any)
        )
      );

    if (emptyCarts.length > 0) {
      const ids = emptyCarts.map((c) => c.id);
      await db.delete(cartsTable).where(inArray(cartsTable.id, ids));
      logger.info({ deleted: emptyCarts.length }, 'Cleaned abandoned carts');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to clean abandoned carts');
  }
};

export const registerCleanupJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running nightly token cleanup');
    await cleanExpiredRefreshTokens();
    await cleanExpiredPasswordResetTokens();
  });

  cron.schedule('0 1 * * 0', async () => {
    logger.info('Running weekly cart cleanup');
    await cleanAbandonedCarts();
  });

  logger.info('Cleanup jobs registered');
};
