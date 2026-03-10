import { Router } from 'express';
import { AuthController } from '../controllers/auth.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';
import {
  changePasswordLimiter,
  forgotPasswordHourlyLimiter,
  forgotPasswordRecentLimiter,
  loginEmailLimiter,
  loginIpLimiter,
  registerIpLimiter,
  resendVerificationLimiter,
} from '../middlewares/rateLimit.ts';
import { validateInput } from '../middlewares/validation.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import {
  changePasswordSchema,
  forgotPasswordSchemaValidation,
  loginSchemaValidation,
  resendEmailSchemaValidation,
  resetPasswordSchemaValidation,
  signupSchemaValidation,
  updateUserSchema,
} from '../validations/auth.validations.ts';

const router = Router();

router.post(
  '/register',
  registerIpLimiter,
  validateInput(signupSchemaValidation),
  asyncHandler(AuthController.register)
);

router.get('/verify-email', asyncHandler(AuthController.verifyEmail));

router.post(
  '/login',
  loginEmailLimiter,
  loginIpLimiter,
  validateInput(loginSchemaValidation),
  asyncHandler(AuthController.login)
);

router.post(
  '/resend-verification',
  resendVerificationLimiter,
  validateInput(resendEmailSchemaValidation),
  asyncHandler(AuthController.resendVerificationMail)
);

router.post('/refresh-token', asyncHandler(AuthController.refreshAccessToken));

router.post(
  '/forgot-password',
  forgotPasswordRecentLimiter,
  forgotPasswordHourlyLimiter,
  validateInput(forgotPasswordSchemaValidation),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validateInput(resetPasswordSchemaValidation),
  AuthController.resetPassword
);

// //Authenticated Routes
router.use(authenticate);

router.post('/logout', asyncHandler(AuthController.logout));
router.post('/logout-all', asyncHandler(AuthController.logoutAll));

router.post(
  '/change-password',
  // changePasswordLimiter,
  validateInput(changePasswordSchema),
  AuthController.changePassword
);

router.patch(
  '/profile',
  validateInput(updateUserSchema),
  asyncHandler(AuthController.updateUser)
);

export default router;
