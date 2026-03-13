import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist';
import { authenticate } from '../middlewares/auth.middleware';
import { validateUrlParams } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { productIdParamsSchema } from '../validations/urlParams';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(WishlistController.getItems));
router.post(
  '/:productId',
  validateUrlParams(productIdParamsSchema),
  asyncHandler(WishlistController.addItem)
);
router.delete(
  '/productId',
  validateUrlParams(productIdParamsSchema),
  asyncHandler(WishlistController.removeItem)
);

export default router;
