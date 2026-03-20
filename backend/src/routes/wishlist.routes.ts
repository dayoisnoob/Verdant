import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateUrlParams } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
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
  '/:productId',
  validateUrlParams(productIdParamsSchema),
  asyncHandler(WishlistController.removeItem)
);

export default router;
