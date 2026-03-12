import { z } from 'zod';

export const addCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z
    .number()
    .positive('Value must be greater than 0')
    .refine((val) => true),
  minOrderAmount: z.number().min(0).nullable().default(null),
  usageLimit: z.number().int().positive().nullable().default(null),
  perUserLimit: z.number().int().positive().nullable().default(null),
  expiresAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  isActive: z.boolean().default(true),
  usedCount: z.number().default(0).optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().toUpperCase(),
  subtotal: z.string(),
});

export const createCouponSchema = z.union([
  addCouponSchema,
  z.array(addCouponSchema).min(1),
]);

export type CouponInput = z.infer<typeof addCouponSchema>;
