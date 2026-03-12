import { Router } from 'express';
import { CouponController } from '../controllers/coupon';
import { authenticate } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { applyCouponSchema, createCouponSchema } from '../validations/coupon';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CouponController.getCoupons));
router.get('/:code', asyncHandler(CouponController.getCouponByCode));
router.post(
  '/apply',
  validateInput(applyCouponSchema),
  asyncHandler(CouponController.applyCoupon)
);
router.post(
  '/',
  validateInput(createCouponSchema),
  asyncHandler(CouponController.addCoupon)
);
router.delete('/', asyncHandler(CouponController.removeCouponFromCart));

export default router;
