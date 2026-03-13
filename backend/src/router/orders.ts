import { Router } from 'express';
import { OrderController } from '../controllers/orders';
import { authenticate } from '../middlewares/auth.middleware';
import { validateUrlParams, validateUrlQuery } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrdersSchema } from '../validations/order';
import { sessionIdParamsSchema } from '../validations/urlParams';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateUrlQuery(getOrdersSchema),
  asyncHandler(OrderController.getOrders)
);
router.get(
  '/session/:sessionId',
  validateUrlParams(sessionIdParamsSchema),
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
