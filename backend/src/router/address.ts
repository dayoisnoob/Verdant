import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { AddressController } from '../controllers/address';
import { addressSchema } from '../validations/address';

const router = Router();

router.use(authenticate);

router.get('/', AddressController.getAddress);
router.post(
  '/',
  validateInput(addressSchema),
  asyncHandler(AddressController.addAddress)
);

router.patch(
  '/:addressId/set-default',
  authenticate,
  asyncHandler(AddressController.setDefaultAddress)
);

router.patch(
  '/',
  validateInput(addressSchema),
  asyncHandler(AddressController.updateAddress)
);

router.delete('/', asyncHandler(AddressController.removeAddress));

export default router;
