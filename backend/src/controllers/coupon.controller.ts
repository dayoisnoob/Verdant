import type { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse } from '../utils/api-response';

export class CouponController {
  static async addCoupon(req: Request, res: Response) {
    const result = await CouponService.addCoupon(req.body);

    res.json(new ApiResponse(200, result.message, result.newCoupon));
  }

  static async getCoupons(req: Request, res: Response) {
    const coupons = await CouponService.getCoupons();

    res.json(
      new ApiResponse(200, 'Coupons Retrieved successfully', { coupons })
    );
  }
  static async getCouponByCode(req: Request, res: Response) {
    const { code } = req.params;
    const coupon = await CouponService.getCouponByCode(code as string);

    res.json(new ApiResponse(200, 'Coupon retrieved successfully', { coupon }));
  }

  static async applyCoupon(req: Request, res: Response) {
    const id = req.user!.id as string;
    const { code, subtotal } = req.body;

    const result = await CouponService.applyCoupon(id, code, subtotal);

    res.json(new ApiResponse(200, 'Coupon applied successfully', result));
  }

  static async removeCouponFromCart(req: Request, res: Response) {
    await CouponService.removeCouponFromCart(req.user!.id);

    res.json(new ApiResponse(200, 'Coupon removed successfully'));
  }
}
