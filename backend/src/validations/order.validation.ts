import { z } from 'zod';

export const getOrdersQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

const itemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(100),
});

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  countryCode: z.string().length(2, 'Must be a 2-letter country code'),
  phone: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum([
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
});

export type updateOrderInput = z.infer<typeof updateOrderSchema>;
