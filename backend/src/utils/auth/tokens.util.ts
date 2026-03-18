import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { logger } from '../../config/pino.js';
import { refreshTokensTable } from '../../models/refreshToken.js';
import type { DeviceInfo, JwtPayload, User } from '../../types/types.js';
import { tokenExpiry } from '../helpers.js';
import { cryptoHash, randomBytes } from './hash.util.js';
import { jwtToken } from './jwt.util.js';

type DbOrTx = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;
type PartialUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'role'
  | 'firstName'
  | 'lastName'
  | 'emailVerified'
  | 'isActive'
  | 'createdAt'
>;

export class Tokens {
  static async generateTempTokens() {
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = cryptoHash(token);
    const expiry = tokenExpiry('temp');

    return { token, hashedToken, expiry };
  }

  static async generateAuthTokens(
    userData: PartialUser,
    deviceInfo: DeviceInfo,
    storedFamilyId?: string,
    tx: DbOrTx = db
  ) {
    const jwtPayload: JwtPayload = {
      id: userData.id,
      role: userData.role,
      email: userData.email,
      isActive: userData.isActive,
    };

    const accessToken = jwtToken(jwtPayload);
    const refreshToken = randomBytes();
    const hashedRefreshToken = cryptoHash(refreshToken);
    const tokenFamilyId = storedFamilyId ?? crypto.randomUUID();

    await tx.insert(refreshTokensTable).values({
      userId: userData.id,
      tokenHash: hashedRefreshToken,
      tokenFamilyId,
      expiresAt: tokenExpiry('refresh'),
      lastUsedAt: new Date(),
      ipAddress: deviceInfo?.ip || null,
      userAgent: deviceInfo?.userAgent || null,
      deviceId: deviceInfo?.deviceId || null,
    });

    const user = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      isVerified: userData.emailVerified,
      createdAt: userData.createdAt,
    };

    return { accessToken, refreshToken, user };
  }

  static async revokeTokenFamily(tokenFamilyId: string) {
    const result = await db
      .update(refreshTokensTable)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(refreshTokensTable.tokenFamilyId, tokenFamilyId))
      .returning();

    if (result && result.length > 0) {
      logger.warn(
        {
          familyId: tokenFamilyId,
          userId: result[0]?.userId,
        },
        'Token family revoked'
      );
    }
  }
}
