import { z } from 'zod';

export const urlParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format.').optional(),
  slug: z.string().optional(),
  token: z.string().optional,
});
