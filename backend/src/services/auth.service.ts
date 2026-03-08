import { and, eq, gt } from 'drizzle-orm';
import { db } from '../config/db.ts';

import { usersTable } from '../models/users.ts';
import { ApiError } from '../utils/apiResponse.ts';
import {
  bcryptCompare,
  bcryptHash,
  cryptoHash,
} from '../utils/auth/hash.util.js';

import { env } from '../config/env.ts';
import { logger } from '../config/pino.ts';
import { passwordResetTokensTable } from '../models/passwordResetToken.ts';
import { refreshTokensTable } from '../models/refreshToken.ts';
import type { DeviceInfo, RegisterResult } from '../types/types.ts';
import { AuthTokens, TempToken } from '../utils/auth/tokens.util.ts';
import type {
  LoginInput,
  SignupInput,
} from '../validations/auth.validations.ts';
import { sendMail } from './email.service.ts';

export class AuthService {
  static async register(
    userData: SignupInput,
    deviceInfo: DeviceInfo
  ): Promise<RegisterResult> {
    const { firstName, lastName, email, password } = userData;

    const normalisedEmail = email?.toLowerCase();

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalisedEmail as string))
      .limit(1);

    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const hashedPassword = await bcryptHash(password);

    const { token, hashedToken, tokenExpiry } = await TempToken.generate();

    const userObject = {
      firstName,
      lastName,
      email: normalisedEmail,
      passwordHash: hashedPassword,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpiry: tokenExpiry,
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
      'User rigistered'
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    sendMail(newUser, verificationLink, 'verification');

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    };
  }

  static async verifyEmail(
    verificationToken: string | undefined,
    deviceInfo: DeviceInfo
  ) {
    if (!verificationToken) {
      throw new ApiError(
        400,
        'This verification link is invalid or has expired. Please request a new one.'
      );
    }

    const hashedToken = cryptoHash(verificationToken);

    console.log(verificationToken);

    const [result] = await db
      .update(usersTable)
      .set({
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      })
      .where(
        and(
          eq(usersTable.emailVerified, false),
          eq(usersTable.emailVerifyToken, hashedToken),
          gt(usersTable.emailVerifyTokenExpiry, new Date())
        )
      )
      .returning();

    if (!result) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    logger.info(
      {
        userId: result.id,
        email: result.email,
        ip: deviceInfo.ip,
      },
      'Email successfully verified'
    );

    return {
      message:
        'Email verification successful. Please proceed to login to your account.',
    };
  }

  static async login(credentials: LoginInput, deviceInfo: DeviceInfo) {
    const { email, password } = credentials;

    const normalisedEmail = email.toLowerCase();

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
      .where(eq(usersTable.email, normalisedEmail));

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcryptCompare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
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

    const { accessToken, refreshToken, updatedUser } = await db.transaction(
      async (tx) => {
        await tx
          .update(usersTable)
          .set({ lastLogin: new Date() })
          .where(eq(usersTable.id, user.id));

        const tokenFamilyId = crypto.randomUUID();

        return await AuthTokens.generateAndUpdate(
          user,
          tokenFamilyId,
          deviceInfo,
          tx
        );
      }
    );

    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: deviceInfo.ip,
      },
      'User logged in'
    );

    const cleanUser = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
    };

    return {
      message: 'Login successful',
      user: cleanUser,
      accessToken,
      refreshToken,
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
      .where(eq(usersTable.email, email.toLowerCase()));

    if (!user) {
      throw new ApiError(
        200,
        'If this email is registered and unverified, a new verification email has been sent.'
      );
    }

    if (user.emailVerified) {
      throw new ApiError(
        200,
        'If this email is registered and unverified, a new verification email has been sent.'
      );
    }

    const { token, hashedToken, tokenExpiry } = await TempToken.generate();

    await db
      .update(usersTable)
      .set({
        emailVerifyToken: hashedToken,
        emailVerifyTokenExpiry: tokenExpiry,
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

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    sendMail(user, verificationLink, 'verification');

    return { message: 'Verification email sent successfully' };
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

      await AuthTokens.revokeTokenFamily(storedToken.tokenFamilyId);

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
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, storedToken.userId),
          eq(usersTable.emailVerified, true)
        )
      )
      .limit(1);

    if (!user) {
      await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, storedToken.userId));

      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(refreshTokensTable)
        .set({ rotatedAt: new Date() })
        .where(eq(refreshTokensTable.id, storedToken.id));

      return await AuthTokens.generateAndUpdate(
        user,
        storedToken.tokenFamilyId,
        deviceInfo,
        tx
      );
    });

    logger.info({ userId: user.id, ip: deviceInfo.ip }, 'Token refreshed');

    return { message: 'Access token successfully refreshed', result };
  }

  static async logout(refreshToken: string, deviceInfo: DeviceInfo) {
    if (!refreshToken) {
      throw new ApiError(401, 'You have been signed out successfully.');
    }
    const hashedToken = cryptoHash(refreshToken);

    const [deletedToken] = await db
      .delete(refreshTokensTable)
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
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.userId, userId));

    logger.info(
      {
        userId,
        ip: deviceInfo.ip,
      },
      'User logged out from all devices'
    );

    return { message: 'Successful logout from all devices' };
  }

  static async forgotPassword(email: string, deviceInfo: DeviceInfo) {
    const normalisedEmail = email.toLowerCase();

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.email, normalisedEmail))
      .limit(1);

    if (!user) {
      logger.info(
        `Password reset requested for non-existent email: ${normalisedEmail}`
      );

      return {
        success: true,
        message: `If email exists, We'll send a reset link`,
      };
    }

    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, user.id));

    const {
      token,
      hashedToken: tokenHash,
      tokenExpiry: expiresAt,
    } = await TempToken.generate();

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: deviceInfo.ip,
      attempts: 0,
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    sendMail(user, resetUrl, 'forgotPassword');

    logger.info(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        ip: deviceInfo.ip,
        timestamp: new Date(),
      },
      'Forgot password audit:'
    );

    return {
      message: `If email exists, We'll send a reset link`,
    };
  }

  static async resetPassword(
    passwordResetToken: string,
    passwords: {
      newPassword: string;
      confirmNewPassword: string;
    },
    deviceInfo: DeviceInfo
  ) {
    const { newPassword } = passwords;

    console.log(passwords);

    const hashedToken = cryptoHash(passwordResetToken);

    const [resetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, hashedToken))
      .limit(1);

    if (!resetToken) {
      throw new ApiError(
        401,
        'This password reset link is invalid or has expired. Please request a new one.'
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await db
        .delete(passwordResetTokensTable)
        .where(eq(passwordResetTokensTable.id, resetToken.id));

      throw new ApiError(
        401,
        'This password reset link has expired. Please request a new one.'
      );
    }

    if (resetToken.used) {
      throw new ApiError(
        401,
        'This password reset link has already been used. Please request a new one if needed.'
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
        401,
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
        })
        .where(eq(passwordResetTokensTable.id, resetToken.id));

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, user.id));
    });

    sendMail(user, '', 'changePassword');

    logger.info(
      {
        userId: user.id,
        email: user.email,
        ip: deviceInfo.ip,
        timestamp: new Date(),
      },
      'Password reset audit:'
    );

    return {
      message: `Password reset was successful`,
    };
  }

  static async changePassword(
    userId: string,
    passwords: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
    deviceInfo: DeviceInfo
  ) {
    const { currentPassword, newPassword, confirmNewPassword } = passwords;

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

    const iscurrentPasswordCorrect = await bcryptCompare(
      currentPassword,
      user.passwordHash
    );

    if (!iscurrentPasswordCorrect) {
      throw new ApiError(401, 'Your current password is incorrect');
    }

    if (newPassword === currentPassword) {
      throw new ApiError(
        422,
        'Your new password must be different from your current password.'
      );
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

    sendMail(user, '', 'changePassword');

    logger.info(
      {
        id: user.id,
        email: user.email,
        ip: deviceInfo.ip,
        timestamp: new Date(),
      },
      'Password change audit:'
    );

    return {
      message: `Password was successfully changed`,
    };
  }
}
