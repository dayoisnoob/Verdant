import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { AddressController } from '../controllers/address';
import { addressSchema } from '../validations/address';
import { WishlistController } from '../controllers/wishlist';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getItems);
router.post('/', asyncHandler(WishlistController.addItem));

router.delete('/', WishlistController.removeItem);

export default router;
