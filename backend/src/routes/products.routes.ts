import { Router } from 'express';
import { ProductController } from '../controllers/products.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  validateInput,
  validateUrlParams,
  validateUrlQuery,
} from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  createProductValidation,
  getProductsSchema,
  updateProductSchema,
} from '../validations/products';
import { idParamsSchema, slugParamsSchema } from '../validations/urlParams';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { FIVE_MIN_CACHE, ONE_HOUR_CACHE, TEN_MIN_CACHE } from '../constants';

const router = Router();

router.get(
  '/',
  validateUrlQuery(getProductsSchema),
  cacheMiddleware(FIVE_MIN_CACHE),
  asyncHandler(ProductController.getPaginatedProducts)
);

router.get('/all', asyncHandler(ProductController.getAllProducts));

router.post('/suggested', asyncHandler(ProductController.getSuggestedProducts));
router.get(
  '/related/:slug',
  validateUrlParams(slugParamsSchema),
  cacheMiddleware(TEN_MIN_CACHE),
  asyncHandler(ProductController.getRelatedProducts)
);

router.get(
  '/categories',
  cacheMiddleware(ONE_HOUR_CACHE),
  asyncHandler(ProductController.getCategories)
);

router.get(
  '/:slug',
  validateUrlParams(slugParamsSchema),
  asyncHandler(ProductController.getProductBySlug)
);

router.get(
  '/analytics/best-selling',
  cacheMiddleware(1800),
  asyncHandler(ProductController.bestSelling)
);
router.get(
  '/analytics/trending',
  cacheMiddleware(900),
  asyncHandler(ProductController.trending)
);

router.use(authenticate, requireAdmin);

router.post(
  '/',
  validateInput(createProductValidation),
  asyncHandler(ProductController.createProduct)
);

router.patch(
  '/:id',
  validateUrlParams(idParamsSchema),
  validateInput(updateProductSchema),
  asyncHandler(ProductController.updateProduct)
);

router.delete(
  '/:id',
  validateUrlParams(idParamsSchema),
  asyncHandler(ProductController.deleteProduct)
);

export default router;
