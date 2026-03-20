import { and, eq, gt, sql } from 'drizzle-orm';
import { db } from '../config/db';

import { usersTable } from '../db/schema/users';
import { ApiError } from '../utils/api-response';
import { bcryptCompare, bcryptHash, cryptoHash } from '../utils/hash.util';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { RESEND_COOLDOWN_SECONDS } from '../constants';
import { cartsTable } from '../db/schema/cart.ts';
import { ordersTable } from '../db/schema/orders.ts';
import { passwordResetTokensTable } from '../db/schema/passwordResetToken';
import { refreshTokensTable } from '../db/schema/refreshToken';
import { wishlistsTable } from '../db/schema/wishlist';
import { queueEmail } from '../queues/email.queue';
import type { DeviceInfo } from '../types/types';
import { Tokens } from '../utils/tokens.util';
import type {
  LoginInput,
  SignupInput,
  updateInput,
} from '../validations/auth.validation';

export class AuthService {
  static async register(userData: SignupInput, deviceInfo: DeviceInfo) {
    const { firstName, lastName, email, password } = userData;

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const hashedPassword = await bcryptHash(password);

    const { token, hashedToken, expiry } = await Tokens.generateTempTokens();

    const userObject = {
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpiry: expiry,
      emailVerifyTokenSentAt: new Date(),
    };

    const [newUser] = await db
      .insert(usersTable)
      .values(userObject)
      .returning();

    if (!newUser) {
      throw new ApiError(
        500,
        'Registration failed. Please try again or contact support.'
      );
    }

    logger.info(
      {
        userId: newUser.id,
        email: newUser.email,
        ip: deviceInfo.ip,
      },
      'User registered'
    );

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await queueEmail({
        user: { firstName: newUser.firstName, email: newUser.email },
        link: verificationLink,
        type: 'verification',
      });
    } catch (err) {
      logger.error(
        { userId: newUser.id, err },
        'Failed to queue verification email'
      );
    }

    const user = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    };

    return user;
  }

  static async verifyEmail(token: string, deviceInfo: DeviceInfo) {
    const hashedToken = cryptoHash(token);

    const [updated] = await db
      .update(usersTable)
      .set({
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
        emailVerifyTokenSentAt: null,
        lastLogin: new Date(),
      })
      .where(
        and(
          eq(usersTable.emailVerified, false),
          eq(usersTable.emailVerifyToken, hashedToken),
          gt(usersTable.emailVerifyTokenExpiry, new Date())
        )
      )
      .returning({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role,
        email: usersTable.email,
        isActive: usersTable.isActive,
        emailVerified: usersTable.emailVerified,
        createdAt: usersTable.createdAt,
      });

    if (!updated) {
      throw new ApiError(
        400,
        'This verification link is invalid or has expired. Please request a new one'
      );
    }

    const { accessToken, refreshToken, user } = await Tokens.generateAuthTokens(
      updated,
      deviceInfo
    );

    logger.info(
      {
        userId: updated.id,
        email: updated.email,
        ip: deviceInfo.ip,
      },
      'Email successfully verified, user logged in'
    );

    return { accessToken, refreshToken, user };
  }

  static async login(credentials: LoginInput, deviceInfo: DeviceInfo) {
    const { email, password } = credentials;

    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        role: usersTable.role,
        emailVerified: usersTable.emailVerified,
        isActive: usersTable.isActive,
        passwordHash: usersTable.passwordHash,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      throw new ApiError(403, 'Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ApiError(
        403,
        'Please verify your email address before signing in. Check your inbox or request a new verification email'
      );
    }
    if (!user.isActive) {
      throw new ApiError(
        403,
        'Your account has been suspended. Please contact support for assistance.'
      );
    }

    const isPasswordValid = await bcryptCompare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(403, 'Invalid credentials');
    }

    db.update(usersTable)
      .set({ lastLogin: new Date() })
      .where(eq(usersTable.id, user.id))
      .catch((err) =>
        logger.warn({ userId: user.id, err }, 'Failed to update lastLogin')
      );

    const {
      accessToken,
      refreshToken,
      user: loggedInUser,
    } = await Tokens.generateAuthTokens(user, deviceInfo);

    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: deviceInfo.ip,
      },
      'User logged in'
    );

    return {
      accessToken,
      refreshToken,
      user: loggedInUser,
    };
  }

  static async resendVerificationMail(email: string, deviceInfo: DeviceInfo) {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        emailVerified: usersTable.emailVerified,
        emailVerifyTokenSentAt: usersTable.emailVerifyTokenSentAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return {
        message:
          'If this email is registered and unverified, a new verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      return {
        message:
          'If this email is registered and unverified, a new verification email has been sent.',
      };
    }

    if (user.emailVerifyTokenSentAt) {
      const secondsSinceSent =
        (Date.now() - user.emailVerifyTokenSentAt.getTime()) / 1000;
      if (secondsSinceSent < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(
          RESEND_COOLDOWN_SECONDS - secondsSinceSent
        );
        throw new ApiError(
          429,
          `Please wait ${waitSeconds} seconds before requesting another email`
        );
      }
    }

    const { token, hashedToken, expiry } = await Tokens.generateTempTokens();

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await queueEmail({
      user: { firstName: user.firstName, email: user.email },
      link: verificationLink,
      type: 'verification',
    });

    await db
      .update(usersTable)
      .set({
        emailVerifyToken: hashedToken,
        emailVerifyTokenExpiry: expiry,
        emailVerifyTokenSentAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: deviceInfo.ip,
      },
      'Verification email resent'
    );

    return {
      message: 'Verification email resent.',
    };
  }

  static async refreshAccessToken(
    refreshToken: string,
    deviceInfo: DeviceInfo
  ) {
    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

    const hashedToken = cryptoHash(refreshToken);

    const [storedToken] = await db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.tokenHash, hashedToken),
          eq(refreshTokensTable.isRevoked, false),
          gt(refreshTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!storedToken) {
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    if (storedToken.rotatedAt) {
      logger.warn(
        {
          tokenId: storedToken.id,
          familyId: storedToken.tokenFamilyId,
          userId: storedToken.userId,
          rotatedAt: storedToken.rotatedAt,
          attemptedAt: new Date(),
        },
        'Token reuse detected!!'
      );

      await AuthService.revokeTokenFamily(storedToken.tokenFamilyId);

      throw new ApiError(
        401,
        'Security violation detected. Please login again'
      );
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        role: usersTable.role,
        emailVerified: usersTable.emailVerified,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, storedToken.userId),
          eq(usersTable.emailVerified, true),
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      await AuthService.revokeTokenFamily(storedToken.tokenFamilyId);
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(refreshTokensTable)
        .set({ rotatedAt: new Date(), isRevoked: true, revokedAt: new Date() })
        .where(eq(refreshTokensTable.id, storedToken.id));

      return await Tokens.generateAuthTokens(
        user,
        deviceInfo,
        storedToken.tokenFamilyId,
        tx
      );
    });

    logger.info({ userId: user.id, ip: deviceInfo.ip }, 'Token refreshed');

    return result;
  }

  static async logout(refreshToken: string, deviceInfo: DeviceInfo) {
    const hashedToken = cryptoHash(refreshToken);

    const [deletedToken] = await db
      .update(refreshTokensTable)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(refreshTokensTable.tokenHash, hashedToken))
      .returning({ userId: refreshTokensTable.userId });

    if (deletedToken) {
      logger.info(
        {
          userId: deletedToken.userId,
          ip: deviceInfo.ip,
        },
        'User logged out'
      );
    }

    return { message: 'Logout successful' };
  }

  static async logoutAll(userId: string, deviceInfo: DeviceInfo) {
    await db
      .update(refreshTokensTable)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(refreshTokensTable.userId, userId))
      .returning({ userId: refreshTokensTable.userId });

    logger.info(
      {
        userId,
        ip: deviceInfo.ip,
      },
      'User logged out from all devices'
    );

    return { message: 'Logout successful' };
  }

  static async forgotPassword(email: string, deviceInfo: DeviceInfo) {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      logger.info(
        { email, ip: deviceInfo.ip },
        `Password reset requested for unregistered email: ${email}`
      );

      return {
        message: `If email exists, We'll send a reset link`,
      };
    }

    const {
      token,
      hashedToken: tokenHash,
      expiry: expiresAt,
    } = await Tokens.generateTempTokens();

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await queueEmail({
      user: { firstName: user.firstName, email: user.email },
      link: resetUrl,
      type: 'forgotPassword',
    });

    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, user.id));

    (await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: deviceInfo.ip,
      attempts: 0,
    }),
      logger.info(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          ip: deviceInfo.ip,
          timestamp: new Date(),
        },
        'Forgot password audit:'
      ));

    return {
      message: `If email exists, We'll send a reset link`,
    };
  }

  static async resetPassword(
    token: string,
    newPassword: string,
    deviceInfo: DeviceInfo
  ) {
    const hashedToken = cryptoHash(token);

    const [resetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, hashedToken))
      .limit(1);

    if (!resetToken) {
      throw new ApiError(
        403,
        'This password reset link is invalid. Please request a new one.'
      );
    }

    if (resetToken.used || resetToken.expiresAt < new Date()) {
      await db
        .update(passwordResetTokensTable)
        .set({ attempts: sql`${passwordResetTokensTable.attempts} + 1` })
        .where(eq(passwordResetTokensTable.id, resetToken.id));

      throw new ApiError(
        403,
        'This password reset link is invalid or has expired.'
      );
    }

    if (resetToken.attempts >= 5) {
      throw new ApiError(
        403,
        'This reset link has been invalidated. Please request a new one.'
      );
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        role: usersTable.role,
        isActive: usersTable.isActive,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(
        and(eq(usersTable.id, resetToken.userId), eq(usersTable.isActive, true))
      )
      .limit(1);

    if (!user) {
      throw new ApiError(
        403,
        'This password reset link is no longer valid. Please request a new one.'
      );
    }

    const isSamePassword = await bcryptCompare(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new ApiError(
        422,
        'Your new password cannot be the same as your old password.'
      );
    }

    const hashedPassword = await bcryptHash(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          passwordHash: hashedPassword,
          passwordChangedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      await tx
        .update(passwordResetTokensTable)
        .set({
          used: true,
          usedAt: new Date(),
          attempts: sql`${passwordResetTokensTable.attempts} + 1`,
        })
        .where(eq(passwordResetTokensTable.id, resetToken.id));

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, user.id));
    });

    await queueEmail({
      user: { firstName: user.firstName, email: user.email },
      link: '',
      type: 'changePassword',
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: deviceInfo.ip,
        timestamp: new Date(),
      },
      'Password reset audit:'
    );
  }

  static async changePassword(
    userId: string,
    passwords: {
      currentPassword: string;
      newPassword: string;
    },
    deviceInfo: DeviceInfo
  ) {
    const { currentPassword, newPassword } = passwords;

    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        email: usersTable.email,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (newPassword === currentPassword) {
      throw new ApiError(
        422,
        'Your new password must be different from your current password.'
      );
    }

    const iscurrentPasswordCorrect = await bcryptCompare(
      currentPassword,
      user.passwordHash
    );

    if (!iscurrentPasswordCorrect) {
      throw new ApiError(403, 'Your current password is incorrect');
    }

    const newPasswordHash = await bcryptHash(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, user.id));
    });

    await queueEmail({
      user: { firstName: user.firstName, email: user.email },
      link: '',
      type: 'changePassword',
    });

    logger.info(
      {
        id: user.id,
        email: user.email,
        ip: deviceInfo.ip,
        timestamp: new Date(),
      },
      'Password change audit:'
    );
  }

  static async updateUser(userId: string, data: updateInput) {
    const [updatedUser] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, userId))
      .returning({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        isVerified: usersTable.emailVerified,
        createdAt: usersTable.createdAt,
      });

    if (!updatedUser) {
      throw new ApiError(500, 'Error updating user');
    }

    return updatedUser;
  }

  static async verifyPassword(userId: string, password: string) {
    const [existing] = await db
      .select({
        id: usersTable.id,
        password: usersTable.passwordHash,
        firstName: usersTable.firstName,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!existing) {
      throw new ApiError(401, 'User not found');
    }

    const isPasswordValid = await bcryptCompare(password, existing.password);

    if (!isPasswordValid) {
      throw new ApiError(403, 'You have entered an incorrect password');
    }

    return existing;
  }

  static async deleteUser(userId: string, password: string) {
    const existing = await AuthService.verifyPassword(userId, password);

    const orders = await db
      .select({ status: ordersTable.status })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.userId, userId),
          eq(ordersTable.status, 'processing')
        )
      );

    if (orders.length > 0) {
      throw new ApiError(
        409,
        'You have orders currently being processed. Please wait until they are fulfilled before deleting your account.'
      );
    }

    const deletedUser = await db.transaction(async (tx) => {
      const [deletedUser] = await tx
        .update(usersTable)
        .set({
          isActive: false,
          deletedAt: new Date(),
          email: `deleted_${existing.id}@deleted.com`,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, userId));
      await tx.delete(cartsTable).where(eq(cartsTable.userId, userId));
      await tx.delete(wishlistsTable).where(eq(wishlistsTable.userId, userId));

      return deletedUser;
    });

    if (!deletedUser) {
      throw new ApiError(500, 'Error deleting user');
    }
    const link = `${env.FRONTEND_URL}/`;

    await queueEmail({
      user: { firstName: existing.firstName, email: existing.email },
      link: link,
      type: 'accountDeletion',
    });

    return;
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
