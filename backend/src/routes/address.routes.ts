import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import { addressSchema } from '../validations/address.validation';
import { addressIdParamsSchema } from '../validations/urlParams.validation';

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
  validateUrlParams(addressIdParamsSchema),
  asyncHandler(AddressController.setDefaultAddress)
);

router.patch(
  '/:addressId',
  validateUrlParams(addressIdParamsSchema),
  validateInput(addressSchema),
  asyncHandler(AddressController.updateAddress)
);

router.delete('/:addressId', asyncHandler(AddressController.removeAddress));

export default router;
