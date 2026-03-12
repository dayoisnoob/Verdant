import { Router } from 'express';
import { AddressController } from '../controllers/address';
import { authenticate } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { addressSchema } from '../validations/address';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(AddressController.getAddress));
router.post(
  '/',
  validateInput(addressSchema),
  asyncHandler(AddressController.addAddress)
);

router.patch(
  '/:addressId/set-default',
  asyncHandler(AddressController.setDefaultAddress)
);

router.patch(
  '/:addressId',
  validateInput(addressSchema),
  asyncHandler(AddressController.updateAddress)
);

router.delete('/:addressId', asyncHandler(AddressController.removeAddress));

export default router;
