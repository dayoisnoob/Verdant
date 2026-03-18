import { Router } from 'express';
import { CouponController } from '../controllers/coupon';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateInput, validateUrlParams } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { applyCouponSchema, createCouponSchema } from '../validations/coupon';
import { codeParamsSchema } from '../validations/urlParams';

const router = Router();

router.use(authenticate);

router.post(
  '/apply',
  validateInput(applyCouponSchema),
  asyncHandler(CouponController.applyCoupon)
);
router.delete('/', asyncHandler(CouponController.removeCouponFromCart));

router.use(requireAdmin);

router.post(
  '/',
  validateInput(createCouponSchema),
  asyncHandler(CouponController.addCoupon)
);

router.get('/', asyncHandler(CouponController.getCoupons));
router.get(
  '/:code',
  validateUrlParams(codeParamsSchema),
  asyncHandler(CouponController.getCouponByCode)
);

export default router;
