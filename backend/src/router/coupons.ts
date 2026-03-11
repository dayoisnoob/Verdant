import { Router } from 'express';
import { CouponController } from '../controllers/coupon';
import { authenticate } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { createCouponValidation } from '../validations/coupon';

const router = Router();

router.use(authenticate);
// requireAdmin;

router.post(
  '/',
  validateInput(createCouponValidation),
  asyncHandler(CouponController.addCoupon)
);

router.get('/', asyncHandler(CouponController.applyCoupon));

router.delete('/', asyncHandler(CouponController.removeCouponFromCart));

export default router;
