import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { CartController } from '../controllers/cart';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CartController.getCart));
router.get('/total', asyncHandler(CartController.getTotal));

router.post('/merge', CartController.mergeGuestCart);
router.post('/items', asyncHandler(CartController.addItem));

router.patch('/items/:itemId', asyncHandler(CartController.updateItem));

router.delete('/', CartController.clearCart);
router.delete('/items/:productId', asyncHandler(CartController.removeItem));

export default router;
