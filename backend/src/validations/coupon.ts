import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z
    .number()
    .positive('Value must be greater than 0')
    .refine((val) => val <= 100, {
      message: 'Percentage value cannot exceed 100',
    }),
  minOrderAmount: z.number().min(0).default(0),
  usageLimit: z.number().int().positive('Usage limit must be at least 1'),
  perUserLimit: z.number().int().positive('Per user limit must be at least 1'),
  expiresAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  isActive: z.boolean().default(true),
  usedCount: z.number().default(0).optional(),
  description: z.string().optional(),
});

export const createCouponValidation = z.union([
  couponSchema,
  z.array(couponSchema).min(1),
]);

export type CouponInput = z.infer<typeof couponSchema>;
