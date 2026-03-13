import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format.'),
});
export const slugParamsSchema = z.object({
  slug: z.string().min(1, 'slug is required'),
});
export const codeParamsSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
});
export const tokenParamsSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
export const productIdParamsSchema = z.object({
  productId: z
    .string()
    .uuid('Invalid ID format')
    .min(1, 'Product Id is required'),
});
export const sessionIdParamsSchema = z.object({
  sessionId: z
    .string()
    .uuid('Invalid ID format')
    .min(1, 'Session Id is required'),
});
export const addressIdParamsSchema = z.object({
  addressId: z
    .string()
    .uuid('Invalid ID format')
    .min(1, 'Address Id is required'),
});
export const itemIdIdParamsSchema = z.object({
  itemId: z.string().uuid('Invalid ID format').min(1, 'Item Id is required'),
});
