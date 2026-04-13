import type { Request, Response } from 'express';
import { PaymentService } from '../services/payments.service';
import { ApiResponse } from '../utils/api-response';

export class PaymentController {
  static async createCheckoutSession(req: Request, res: Response) {
    const { addressId, couponCode, deliveryNotes } = req.body;
    const userId = req.user!.id;

    const url = await PaymentService.createCheckoutSession(
      userId,
      addressId,
      couponCode,
      deliveryNotes
    );

    res.json(new ApiResponse(200, 'Session created', { url }));
  }

  static async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      await PaymentService.handleWebhookEvent(req.body, signature);

      res.json({ received: true });
    } catch (err) {
      res.status(400).json({
        message: err instanceof Error ? err.message : 'Webhook handler failed',
      });
    }
  }
}
