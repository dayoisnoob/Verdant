import express from 'express';

import { asyncHandler } from '../utils/async-handler';
import { PaymentController } from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Webhook must be BEFORE any express.json() middleware and use raw body
router.post('/webhook', asyncHandler(PaymentController.handleWebhook));

router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(PaymentController.createCheckoutSession)
);

export default router;
