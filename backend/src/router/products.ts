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
router.get('/categories', asyncHandler(ProductController.getCategories));

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
