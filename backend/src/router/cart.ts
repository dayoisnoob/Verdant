import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { CartController } from '../controllers/cart';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CartController.getCart));
router.get('/total', asyncHandler(CartController.getTotal));
router.post('/items', asyncHandler(CartController.addItem));
router.patch('/items/:itemId', asyncHandler(CartController.updateItem));
router.delete('/items/:itemId', asyncHandler(CartController.removeItem));
router.delete('/', CartController.clearCart);
router.post('/merge', CartController.mergeGuestCart);

export default router;
