import { Router } from 'express';
import { ProductController } from '../controllers/products';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  validateInput,
  validateUrlParams,
  validateUrlQuery,
} from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createProductValidation,
  getProductsSchema,
  updateProductSchema,
} from '../validations/products';
import { idParamsSchema, slugParamsSchema } from '../validations/urlParams';

const router = Router();

router.get(
  '/',
  validateUrlQuery(getProductsSchema),
  asyncHandler(ProductController.getAllProducts)
);
router.get('/categories', asyncHandler(ProductController.getCategories));

router.get(
  '/:slug',
  validateUrlParams(slugParamsSchema),
  asyncHandler(ProductController.getProductBySlug)
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
