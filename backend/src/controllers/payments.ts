import type { Request, Response } from 'express';
import { PaymentService } from '../services/payments';
import { ApiResponse } from '../utils/apiResponse';

export class PaymentController {
  static async createCheckoutSession(req: Request, res: Response) {
    const {
      items,
      shippingFee,
      addressId,
      discount,
      couponCode,
      deliveryNotes,
    } = req.body;
    const userId = req.user!.id;

    console.log('This is body:', req.body);

    const result = await PaymentService.createCheckoutSession(
      userId,
      items,
      shippingFee,
      addressId,
      discount,
      couponCode,
      deliveryNotes
    );
    res.json(new ApiResponse(200, 'Session created', result));
  }

  static async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;

    try {
      const result = await PaymentService.handleWebhookEvent(
        req.body,
        signature
      );
      console.log(`Webhook received: ${result.type}`);

      res.json({ received: true });
    } catch (err) {
      res.status(400).json({
        message: err instanceof Error ? err.message : 'Webhook handler failed',
      });
    }
  }
}
