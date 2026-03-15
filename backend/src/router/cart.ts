import { Router } from 'express';
import { CartController } from '../controllers/cart';
import { authenticate } from '../middlewares/auth.middleware';
import { validateInput, validateUrlParams } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import {
  addItemSchema,
  mergeCartsSchema,
  updateItemSchema,
} from '../validations/cart';
import { productIdParamsSchema } from '../validations/urlParams';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CartController.getCart));
router.get('/total', asyncHandler(CartController.getTotal));

router.post(
  '/merge',
  validateInput(mergeCartsSchema),
  asyncHandler(CartController.mergeGuestCart)
);
router.post(
  '/items',
  validateInput(addItemSchema),
  asyncHandler(CartController.addItem)
);

router.patch(
  '/items/:productId',
  validateInput(updateItemSchema),
  validateUrlParams(productIdParamsSchema),
  asyncHandler(CartController.updateItem)
);

router.delete('/', asyncHandler(CartController.clearCart));
router.delete(
  '/items/:productId',
  validateUrlParams(productIdParamsSchema),
  asyncHandler(CartController.removeItem)
);

export default router;
