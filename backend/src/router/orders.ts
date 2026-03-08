import { Router } from 'express';
import { OrderController } from '../controllers/orders';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateInput } from '../middlewares/validation';
import { createOrderSchema, updateOrderSchema } from '../validations/order';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(OrderController.getOrders));
router.get(
  '/session/:sessionId',
  asyncHandler(OrderController.getOrderBySession)
);
router.get('/:id', asyncHandler(OrderController.getOrderById));
// router.patch(
//   '/',
//   requireAdmin,
//   validateInput(updateOrderSchema),
//   OrderController.updateOrder
// );

export default router;
