import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import { cartsTable, couponRedemptionsTable } from '../models';
import { couponsTable } from '../models/coupons';
import { ApiError } from '../utils/apiResponse';
import { CartService } from './cart';

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
          'Duplicate coupon codes found in the request..'
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

      const coupons = data.map((d) => ({
        ...d,
        minOrderAmount: d.minOrderAmount ?? null,
        usageLimit: d.usageLimit ?? null,
        perUserLimit: d.perUserLimit ?? null,
        code: d.code.toUpperCase(),
      }));

      const newCoupons = await db
        .insert(couponsTable)
        .values(coupons)
        .returning();

      if (newCoupons.length === 0) {
        throw new ApiError(500, 'Failed to create coupons. Please try again.');
      }

      return {
        message: 'Coupons successfully created',
        count: newCoupons.length,
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

  static async getCoupons() {
    const coupons = await db.select().from(couponsTable);

    return coupons;
  }
  static async getCouponByCode(code: string) {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code.toUpperCase()))
      .limit(1);

    if (!coupon) {
      throw new ApiError(400, 'Coupon not found');
    }

    return coupon;
  }

  static async applyCoupon(userId: string, code: string, subtotal: number) {
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

    if (existing.expiresAt && Date.now() > existing.expiresAt?.getTime()) {
      throw new ApiError(403, 'Code has expired');
    }
    if (
      existing.usageLimit !== null &&
      existing.usedCount >= existing.usageLimit
    ) {
      throw new ApiError(403, 'usage limit reached');
    }

    if (
      existing.discountType === 'fixed' &&
      existing.discountValue * 100 >= subtotal
    ) {
      throw new ApiError(400, 'Your subtotal is too low for this coupon');
    }

    if (
      existing.discountType === 'percentage' &&
      existing.discountValue > 100
    ) {
      throw new Error('Percentage discount cannot exceed 100');
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
    if (
      existing.perUserLimit !== null &&
      userRedemptions.length >= existing.perUserLimit
    ) {
      throw new ApiError(403, `You've already used this coupon`);
    }

    if (
      existing.minOrderAmount !== null &&
      existing.minOrderAmount > subtotal
    ) {
      const amountToSpend = (
        (existing.minOrderAmount - subtotal) /
        100
      ).toFixed(2);
      throw new ApiError(
        403,
        `Spend £${amountToSpend} more to use this coupon`
      );
    }

    const discount =
      existing.discountType === 'percentage'
        ? (subtotal * existing.discountValue) / 100
        : existing.discountValue * 100;

    const { cart } = await CartService.getOrCreateCart(userId);

    const [updated] = await db
      .update(cartsTable)
      .set({ couponCode: code, discount, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string))
      .returning();

    if (!updated) {
      throw new ApiError(500, 'Error applying coupon code');
    }

    return discount;
  }
  static async removeCouponFromCart(userId: string) {
    const { cart } = await CartService.getOrCreateCart(userId);

    const [updated] = await db
      .update(cartsTable)
      .set({ couponCode: null, discount: null, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string))
      .returning();

    if (!updated) {
      throw new ApiError(500, 'Error removing coupon code');
    }
  }
}
