import crypto from 'crypto';
import { cryptoHash, randomBytes } from './hash.util.js';
import type { DeviceInfo, JwtPayload, User } from '../../types/types.js';
import { db } from '../../config/db.js';
import { jwtToken } from './jwt.util.js';
import { refreshTokensTable } from '../../models/refreshToken.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { logger } from '../../config/pino.js';
import { eq } from 'drizzle-orm';

export class TempToken {
  static async generate(): Promise<{
    token: string;
    hashedToken: string;
    tokenExpiry: Date;
  }> {
    const token = this.generateToken();
    const hashedToken = cryptoHash(token);
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    return { token, hashedToken, tokenExpiry };
  }

  static generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }
}

export class AuthTokens {
  static async generateAndUpdate(
    user: Pick<
      User,
      | 'id'
      | 'email'
      | 'role'
      | 'firstName'
      | 'lastName'
      | 'emailVerified'
      | 'isActive'
      | 'createdAt'
    >,
    tokenFamilyId: string,
    deviceInfo: DeviceInfo,
    transaction: NodePgDatabase = db
  ) {
    const jwtPayload: JwtPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      isActive: user.isActive,
    };

    const accessToken = jwtToken(jwtPayload);
    const refreshToken = randomBytes();
    const hashedRefreshToken = cryptoHash(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log('login', refreshToken);

    await transaction.insert(refreshTokensTable).values({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      tokenFamilyId,
      expiresAt,
      lastUsedAt: new Date(),
      ipAddress: deviceInfo?.ip || null,
      userAgent: deviceInfo?.userAgent || null,
      deviceId: deviceInfo?.deviceId || null,
    });

    const cleanUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    return { accessToken, refreshToken, updatedUser: cleanUser };
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
