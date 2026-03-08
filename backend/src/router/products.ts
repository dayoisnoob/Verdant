import { Router } from 'express';
import { ProductController } from '../controllers/products';
import { validateInput, validateUrlParams } from '../middlewares/validation';
import { urlParamsSchema } from '../validations/urlParams';
import {
  createProductValidation,
  updateProductSchema,
} from '../validations/products';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(ProductController.getAllProducts));

router.get(
  '/:slug',
  validateUrlParams(urlParamsSchema),
  asyncHandler(ProductController.getProductBySlug)
);

// router.use(authenticate, requireAdmin);

router.post(
  '/',
  validateInput(createProductValidation),
  ProductController.createProduct
);

// router.patch(
//   '/:id',
//   validateUrlParams(urlParamsSchema),
//   validateInput(updateProductSchema),
//   ProductController.updateProduct
// );

// router.delete(
//   '/:id',
//   validateUrlParams(urlParamsSchema),
//   ProductController.deleteProduct
// );

export default router;

// export const CATEGORY_META: Record<string, { img: string }> = {
//   'Leafy Greens': {
//     img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop',
//   },
//   Brassicas: {
//     img: 'https://images.unsplash.com/photo-1628611048979-d33b63e4a0c5?w=800&h=600&fit=crop',
//   },
//   'Root Vegetables': {
//     img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop',
//   },
//   Berries: {
//     img: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=600&fit=crop',
//   },
//   'Stone Fruits': {
//     img: 'https://images.unsplash.com/photo-1595124750784-b19a2792d379?w=800&h=600&fit=crop',
//   },
//   'Fruiting Vegetables': {
//     img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=600&fit=crop',
//   },
//   Alliums: {
//     img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&h=600&fit=crop',
//   },
//   Legumes: {
//     img: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&h=600&fit=crop',
//   },
//   'Squash & Gourds': {
//     img: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&h=600&fit=crop',
//   },
//   Herbs: {
//     img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
//   },
//   Mushrooms: {
//     img: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=800&h=600&fit=crop',
//   },
// };

// export const FARM_ICONS: Record<string, string> = {
//   'Green Meadow Farm': '🌿',
//   'Sunrise Valley Farm': '🌅',
//   'Willowbrook Organics': '🌾',
//   'Golden Fields Farm': '🌻',
//   'Purple Root Farm': '🥕',
//   'Bluebell Ridge Farm': '🫐',
//   'Thornberry Produce': '🧅',
//   'River Bend Farm': '💧',
//   'Coastal Acres': '🏖️',
//   'Orchard House Farm': '🍑',
//   'Hillside Organics': '⛰️',
//   'Strawberry Hill Farm': '🍓',
//   'Harvest Moon Farm': '🎃',
//   'Meadow Herb Garden': '🌱',
//   'Sunflower Organics': '🌸',
//   'Wildcraft Foragers': '🍄',
//   'Wakefield Rhubarb Co.': '🎋',
// };
