import type { Request, Response } from 'express';
import { COOKIE_OPTIONS } from '../constants.ts';
import { AuthService } from '../services/auth.service';
import { ApiError, ApiResponse } from '../utils/api-response';

export class AuthController {
  static deviceInfo(req: Request) {
    return {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      deviceId: req.get('x-device-id') || null,
    };
  }

  static async register(req: Request, res: Response) {
    const user = await AuthService.register(
      req.body,
      AuthController.deviceInfo(req)
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'Registration successful', { user }));
  }

  static async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Verification token is missing.');
    }

    const result = await AuthService.verifyEmail(
      token,
      AuthController.deviceInfo(req)
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS).json(
      new ApiResponse(200, 'Email verified successfully', {
        user: result.user,
        accessToken: result.accessToken,
      })
    );
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(
      req.body,
      AuthController.deviceInfo(req)
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res
      .cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: 15 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, 'Login successful', {
          user: result.user,
          accessToken: result.accessToken,
        })
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

    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

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

    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

    const result = await AuthService.logout(
      refreshToken,
      AuthController.deviceInfo(req)
    );

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json(new ApiResponse(200, result.message));
  }

  static async logoutAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AuthService.logoutAll(
      userId,
      AuthController.deviceInfo(req)
    );

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
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
    const token = req.query?.token;

    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Verification token is missing.');
    }

    const result = await AuthService.resetPassword(
      token,
      req.body.newPassword,
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, 'Password reset was successfully'));
  }

  static async changePassword(req: Request, res: Response) {
    const userId = req.user!.id;

    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(
      userId,
      { currentPassword, newPassword },
      AuthController.deviceInfo(req)
    );

    res.json(new ApiResponse(200, 'Password successfully changed'));
  }

  static async updateUser(req: Request, res: Response) {
    const userId = req.user!.id;

    const updatedUser = await AuthService.updateUser(userId, req.body);
    res.json(
      new ApiResponse(200, 'User successfully updated', { updatedUser })
    );
  }

  static async verifyPassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const { password } = req.body;

    await AuthService.verifyPassword(userId, password);
    res.json(new ApiResponse(200, 'Password successfully verified'));
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.user!.id;
    const { password } = req.body;

    await AuthService.deleteUser(userId, password);

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json(new ApiResponse(200, 'User successfully deleted'));
  }
}
