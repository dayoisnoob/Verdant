import crypto from 'crypto';
import { db } from '../config/db';
import { refreshTokensTable } from '../db/schema/refreshToken';
import { cryptoHash, randomBytes } from './hash.util';
import { tokenExpiry } from './helpers';
import { jwtToken } from './jwt.util';
import type { DeviceInfo, User } from '../types/auth.types';
import type { JwtPayload } from 'jsonwebtoken';

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
}
