import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be a positive number'),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(10),
});

export const mergeCartsSchema = z
  .array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive('Quantity must be a positive number'),
    })
  )
  .min(1, 'Cart cannot be empty');
