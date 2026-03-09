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
router.patch('/coupon/', asyncHandler(CartController.applyCouponToCart));
router.delete('/items/:itemId', asyncHandler(CartController.removeItem));
router.delete('/coupon/', asyncHandler(CartController.removeCouponFromCart));
router.delete('/', CartController.clearCart);
router.post('/merge', CartController.mergeGuestCart);

export default router;
