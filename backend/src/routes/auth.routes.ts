import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.ts';
import {
  changePasswordLimiter,
  forgotPasswordHourlyLimiter,
  forgotPasswordRecentLimiter,
  loginEmailLimiter,
  loginIpLimiter,
  refreshTokenLimiter,
  registerIpLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from '../middleware/rate-limit.middleware.ts';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resendEmailSchemaValidation,
  resetPasswordSchemaValidation,
  signupSchema,
  updateUserSchema,
} from '../validations/auth.validations.ts';

const router = Router();

router.post(
  '/register',
  registerIpLimiter,
  validateInput(signupSchema),
  asyncHandler(AuthController.register)
);

router.get('/verify-email', asyncHandler(AuthController.verifyEmail));

router.post(
  '/login',
  loginEmailLimiter,
  loginIpLimiter,
  validateInput(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  '/resend-verification',
  resendVerificationLimiter,
  validateInput(resendEmailSchemaValidation),
  asyncHandler(AuthController.resendVerificationMail)
);

router.post(
  '/refresh-token',
  refreshTokenLimiter,
  asyncHandler(AuthController.refreshAccessToken)
);

router.post(
  '/forgot-password',
  forgotPasswordRecentLimiter,
  forgotPasswordHourlyLimiter,
  validateInput(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);

router.post(
  '/reset-password',
  resetPasswordLimiter,
  validateInput(resetPasswordSchemaValidation),
  asyncHandler(AuthController.resetPassword)
);

// //Authenticated Routes
router.use(authenticate);

router.post('/logout', asyncHandler(AuthController.logout));
router.post('/logout-all', asyncHandler(AuthController.logoutAll));

router.patch(
  '/change-password',
  changePasswordLimiter,
  validateInput(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

router.patch(
  '/profile',
  validateInput(updateUserSchema),
  asyncHandler(AuthController.updateUser)
);

router.delete(
  '/delete',
  validateInput(deleteAccountSchema),
  asyncHandler(AuthController.deleteUser)
);

export default router;
