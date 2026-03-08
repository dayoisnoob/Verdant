// import { Router } from 'express';
// import { InventoryController } from '../controllers/inventory';
// import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
// import { validateInput, validateUrlParams } from '../middlewares/validation';
// import { updateInventorySchema } from '../validations/products';
// import { urlParamsSchema } from '../validations/urlParams';

// const router = Router();

// router.use(authenticate, requireAdmin);

// router.get(
//   '/:productId',
//   validateUrlParams(urlParamsSchema),
//   InventoryController.fetchInventory
// );

// router.patch(
//   '/:productId',
//   validateUrlParams(urlParamsSchema),
//   validateInput(updateInventorySchema),
//   InventoryController.updateInventory
// );

// export default router;
