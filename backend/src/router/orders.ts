import { Router } from 'express';
import { OrderController } from '../controllers/orders';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validateUrlParams, validateUrlQuery } from '../middlewares/validation';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrdersSchema } from '../validations/order';
import { sessionIdParamsSchema } from '../validations/urlParams';

const router = Router();

router.use(authenticate);

router.get('/all', requireAdmin, asyncHandler(OrderController.getAllOrders));

router.get(
  '/',
  validateUrlQuery(getOrdersSchema),
  asyncHandler(OrderController.getUserOrders)
);
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
