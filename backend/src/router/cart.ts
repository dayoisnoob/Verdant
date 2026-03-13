import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { CartController } from '../controllers/cart';
import { validateInput } from '../middlewares/validation';
import {
  addItemSchema,
  mergeCartsSchema,
  updateItemSchema,
} from '../validations/cart';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CartController.getCart));
router.get('/total', asyncHandler(CartController.getTotal));

router.post(
  '/merge',
  validateInput(mergeCartsSchema),
  CartController.mergeGuestCart
);
router.post(
  '/items',
  validateInput(addItemSchema),
  asyncHandler(CartController.addItem)
);

router.patch(
  '/items/:itemId',
  validateInput(updateItemSchema),
  asyncHandler(CartController.updateItem)
);

router.delete('/', CartController.clearCart);
router.delete('/items/:itemId', asyncHandler(CartController.removeItem));

export default router;
