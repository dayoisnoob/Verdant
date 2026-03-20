import { Router } from 'express';
import { OrderController } from '../controllers/orders.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  validateInput,
  validateUrlParams,
  validateUrlQuery,
} from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import { getOrdersQuery, updateOrderSchema } from '../validations/order.validation';
import {
  orderIdParamsSchema,
  sessionIdParamsSchema,
} from '../validations/urlParams.validation';

const router = Router();

router.use(authenticate);

router.get('/all', requireAdmin, asyncHandler(OrderController.getAllOrders));

router.get(
  '/',
  validateUrlQuery(getOrdersQuery),
  asyncHandler(OrderController.getUserOrders)
);
router.get(
  '/session/:sessionId',
  asyncHandler(OrderController.getOrderBySession)
);
router.get('/:id', asyncHandler(OrderController.getOrderById));

router.patch(
  '/:orderId',
  validateUrlParams(orderIdParamsSchema),
  requireAdmin,
  validateInput(updateOrderSchema),
  asyncHandler(OrderController.updateOrder)
);

export default router;
