import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { OrderService } from '../services/orders';

export class OrderController {
  static async getUserOrders(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await OrderService.getUserOrders(
      userId,
      Number(page),
      Number(limit)
    );

    res.json(
      new ApiResponse(200, 'Orders retrieved', {
        orders: result.allOrders,
        pagination: result.pagination,
      })
    );
  }

  static async getAllOrders(req: Request, res: Response) {
    const orders = await OrderService.getAllOrders();

    res.json(new ApiResponse(200, 'Orders retrieved', orders));
  }

  static async getOrderBySession(req: Request, res: Response) {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId as string;

    const orderNumber = await OrderService.getOrderBySessionId(
      userId,
      sessionId
    );

    res.json(new ApiResponse(200, 'Order session retrieved', { orderNumber }));
  }

  static async getOrderById(req: Request, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const order = await OrderService.getOrderById(userId, id);

    res.json(new ApiResponse(200, 'Order fetched', order));
  }

  static async updateOrder(req: Request, res: Response) {
    const userId = req.user!.id;
    const orderId = req.params.orderId as string;
    const updateData = req.body;

    const updatedOrder = await OrderService.updateOrderStatus(
      userId,
      orderId,
      updateData
    );

    res.json(
      new ApiResponse(200, 'Order status updated successfully', updatedOrder)
    );
  }
}
