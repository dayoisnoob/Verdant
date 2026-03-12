import type { Request, Response } from 'express';
import { COOKIE_OPTIONS } from '../constants/constants.js';
import { AuthService } from '../services/auth.service.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import type { SignupInput } from '../validations/auth.validations.js';
import { logger } from '../config/pino.js';

export class AuthController {
  static deviceInfo(req: Request) {
    return {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      deviceId: req.get('x-device-id') || null,
    };
  }

  static async register(req: Request, res: Response): Promise<void> {
    const body = req.body as SignupInput;

    logger.info(body);

    const result = await AuthService.register(
      body,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(201, result.message, result.data));
  }

  static async verifyEmail(req: Request, res: Response) {
    const { token: verificationToken } = req.query;

    if (typeof verificationToken !== 'string') {
      throw new ApiError(400, 'Invalid verification link');
    }

    const result = await AuthService.verifyEmail(
      verificationToken,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, result.message));
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(
      req.body,
      AuthController.deviceInfo(req)
    );

    res
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(200, result.message, result.user, result.accessToken)
      );
  }

  static async loginAsAdmin(req: Request, res: Response) {
    const result = await AuthService.loginAsAdmin(
      req.body,
      AuthController.deviceInfo(req)
    );

    res
      .cookie('adminRefreshToken', result.refreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(200, result.message, result.user, result.accessToken)
      );
  }

  static async resendVerificationMail(req: Request, res: Response) {
    const { email } = req.body;

    const result = await AuthService.resendVerificationMail(
      email,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, result.message));
  }

  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    const result = await AuthService.refreshAccessToken(
      refreshToken,
      AuthController.deviceInfo(req)
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS).json(
      new ApiResponse(200, 'Access token successfully refreshed', {
        accessToken: result.accessToken,
      })
    );
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await AuthService.logout(
      refreshToken,
      AuthController.deviceInfo(req)
    );

    res.clearCookie('refreshToken', { path: '/' });
    res.json(new ApiResponse(200, result.message));
  }

  static async logoutAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AuthService.logoutAll(
      userId,
      AuthController.deviceInfo(req)
    );

    res.clearCookie('refreshToken', { path: '/' });
    res.json(new ApiResponse(200, result.message));
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    const result = await AuthService.forgotPassword(
      email,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, result.message));
  }

  static async resetPassword(req: Request, res: Response) {
    const passwordResetToken = req.query?.token;

    if (typeof passwordResetToken !== 'string') {
      throw new ApiError(400, 'Invalid reset token');
    }

    const result = await AuthService.resetPassword(
      passwordResetToken,
      req.body,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, result.message));
  }

  static async changePassword(req: Request, res: Response) {
    const userId = req.user!.id;

    console.log(req.body);

    await AuthService.changePassword(
      userId,
      req.body,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, 'Password was successfully changed'));
  }

  static async updateUser(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AuthService.updateUser(userId, req.body);
    res.json(
      new ApiResponse(200, 'User successfully updated', result.updatedUser)
    );
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { password } = req.body;

    await AuthService.deleteUser(userId, password);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json(new ApiResponse(200, 'User successfully deleted'));
  }

  static async veryfyPassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const { password } = req.body;

    await AuthService.verifyPassword(userId, password);
    res.json(new ApiResponse(200, 'Password successfully verified'));
  }
}
