import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import { addressesTable } from '../models/addresses';
import { ApiError } from '../utils/apiResponse';
import { couponsTable } from '../models/coupons';
import { couponRedemptionsTable } from '../models';

interface CouponType {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  expiresAt: Date;
  isActive?: boolean;
}

export class CouponService {
  static async addCoupon(data: CouponType | CouponType[]) {
    if (Array.isArray(data)) {
      const codes = data.map((d) => d.code);
      const uniqueCodes = new Set(codes);
      if (uniqueCodes.size !== codes.length) {
        throw new ApiError(
          409,
          'Duplicate coupon coses found in the request..'
        );
      }
      const existing = await db
        .select({ code: couponsTable.code })
        .from(couponsTable)
        .where(inArray(couponsTable.code, codes));

      if (existing.length > 0) {
        const existingCodes = existing.map((d) => d.code).join(', ');
        throw new ApiError(409, `These codes already exist: ${existingCodes}`);
      }

      const newCoupon = await db
        .insert(couponsTable)
        .values(data.map((d) => ({ ...d, code: d.code.toUpperCase() })))
        .returning();

      if (!newCoupon) {
        throw new ApiError(500, 'Failed to create coupons. Please try again.');
      }

      return {
        message: 'Coupons successfully created',
        count: newCoupon.length,
      };
    }

    const normalisedCode = data.code.toUpperCase();

    const [existing] = await db
      .select({ id: couponsTable.id })
      .from(couponsTable)
      .where(eq(couponsTable.code, data.code))
      .limit(1);

    if (existing) {
      throw new ApiError(409, 'This code already exists');
    }

    const [newCoupon] = await db
      .insert(couponsTable)
      .values({ ...data, code: normalisedCode })
      .returning();

    return { message: 'Coupon successfully created', newCoupon };
  }

  static async applyCoupon(userId: string, code: string, subtotal: number) {
    if (!code || code === '') {
      throw new ApiError(400, 'Please enter a coupon code');
    }

    const [existing] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code.toUpperCase()))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Code not found');
    }
    if (!existing.isActive) {
      throw new ApiError(403, 'Code is not active');
    }

    if (Date.now() > existing.expiresAt?.getTime()) {
      throw new ApiError(403, 'Code has expired');
    }
    if (existing.usedCount >= existing.usageLimit) {
      throw new ApiError(403, 'usage limit reached');
    }

    const userRedemptions = await db
      .select()
      .from(couponRedemptionsTable)
      .where(
        and(
          eq(couponRedemptionsTable.couponId, existing.id),
          eq(couponRedemptionsTable.userId, userId)
        )
      );
    if (userRedemptions.length >= existing.perUserLimit) {
      throw new ApiError(403, `You've already used this coupon`);
    }

    if (existing.minOrderAmount > subtotal) {
      const amountToSpend = existing.minOrderAmount - subtotal;
      throw new ApiError(403, `Spend ${amountToSpend} more to use this coupon`);
    }

    let discount =
      existing.discountType === 'percentage'
        ? (subtotal * existing.discountValue) / 100
        : existing.discountValue * 100;

    return {
      message: 'Coupon successfully applied',
      discount,
    };
  }
}
