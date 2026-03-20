import * as z from 'zod';

const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().min(1, 'Alt text is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and hyphenated'),

  description: z.string().min(1, 'Description is required'),

  price: z.coerce.number().positive('Price must be greater than 0'),

  originalPrice: z.union([z.coerce.number().positive(), z.null()]).optional(),

  category: z.string().min(1, 'Category is required'),

  unit: z.string().min(1, 'Unit is required'),

  weight: z.string().min(1, 'Weight is required'),

  farm: z.string().min(1, 'Farm name is required'),

  origin: z.string().min(1, 'Origin is required'),

  isOrganic: z.boolean(),

  isSeasonal: z.boolean(),

  isFeatured: z.boolean(),

  isOnSale: z.boolean(),

  inStock: z.boolean(),

  rating: z.coerce
    .number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5'),

  reviewCount: z.coerce
    .number()
    .int('Review count must be an integer')
    .min(0, 'Review count cannot be negative'),

  harvestDaysAgo: z.coerce
    .number()
    .int('Harvest days must be an integer')
    .min(0, 'Harvest days cannot be negative'),

  tags: z.array(z.string()).min(1, 'At least one tag is required'),

  nutritionHighlights: z
    .array(z.string())
    .min(1, 'At least one nutrition highlight is required'),

  storageInstructions: z.string().min(1, 'Storage instructions are required'),

  images: z
    .array(
      z.object({
        alt: z.string().min(1, 'Image alt text is required'),
        url: z.string().url('Image must be a valid URL'),
      })
    )
    .min(1, 'At least one image is required'),
});

export const createProductValidation = z.union([
  productSchema,
  z.array(productSchema).min(1),
]);

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  longDescription: z.string().optional().nullable(),
  price: z.number().optional(),
  compareAtPrice: z.string().optional().nullable(),
  category: z.string().min(1).optional(),
  brand: z.string().optional().nullable(),
  badge: z.enum(['new', 'sale', 'hot', 'popular']).optional().nullable(),
  images: z.array(imageSchema).min(1).optional(),
  specs: z.record(z.string(), z.string()).optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().default('All'),
  filter: z.string().default('All'),
  sort: z.string().default('newest'),
  search: z.string().default(''),
});

export type CreateProductSchema = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
