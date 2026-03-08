import type { Request, Response } from 'express';
import { ApiError, ApiResponse } from '../utils/apiResponse';
import { CouponService } from '../services/coupon';

export class CouponController {
  static async addCoupon(req: Request, res: Response) {
    const result = await CouponService.addCoupon(req.body);

    res.json(new ApiResponse(200, result.message, result.newCoupon));
  }

  static async applyCoupon(req: Request, res: Response) {
    const id = req.user!.id as string;
    const { code, subtotal } = req.query;

    if (!code) {
      throw new ApiError(400, 'Please enter a coupon code');
    }

    const result = await CouponService.applyCoupon(
      id,
      code as string,
      parseFloat(subtotal as string)
    );

    res.json(new ApiResponse(200, result.message, result.data));
  }
}
