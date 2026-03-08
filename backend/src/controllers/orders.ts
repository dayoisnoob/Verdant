import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { OrderService } from '../services/orders';

export class OrderController {
  //   static async createOrder(req: Request, res: Response) {
  //     const orderInfo = req.body;
  //     const userId = req.user!.id;

  //     const result = await OrderService.createOrder(userId, orderInfo);

  //     res.status(201).json(new ApiResponse(201, result.message, result.data));
  //   }

  static async getOrders(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await OrderService.getOrders(
      userId,
      Number(page),
      Number(limit)
    );

    res.json(new ApiResponse(200, result.message, result.data));
  }

  static async getOrderBySession(req: Request, res: Response) {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;

    console.log('sess', userId, sessionId);

    const result = await OrderService.getOrderBySessionId(userId, sessionId);

    res.json(new ApiResponse(200, result.message, result.order));
  }

  static async getOrderById(req: Request, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id as string;

    console.log('id', userId, id);

    const result = await OrderService.getOrderById(userId, id);

    res.json(new ApiResponse(200, result.message, result.formattedOrder));
  }

  //   static async updateOrder(req: Request, res: Response) {
  //     const userId = req.user!.id;
  //     const orderId = req.params.orderId as string;
  //     const updateData = req.body;

  //     const result = await OrderService.updateOrderStatus(
  //       userId,
  //       orderId,
  //       updateData
  //     );

  //     res.json(new ApiResponse(200, result.message, result.data));
  //   }
}

// {
//   "items": [
//     {
//       "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
//       "quantity": 1
//     },
//   ],
//   "address": {
//     "fullName": "Alex Johnson",
//     "line1": "123 Main Street",
//     "line2": "Apt 4B",
//     "city": "San Francisco",
//     "state": "CA",
//     "postalCode": "94102",
//     "countryCode": "US",
//     "phone": "+1 (555) 000-0000"
//   },
//   "shippingMethod": "standard"
// }

// {
//   "orderId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
//   "orderNumber": "ORD-2025-X4K9",
//   "total": 537.51,
//   "status": "pending"
// }
