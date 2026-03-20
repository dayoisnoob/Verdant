import type { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { ApiError, ApiResponse } from '../utils/api-response';

export class CartController {
  static async getCart(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await CartService.getCart(userId);

    res.json(new ApiResponse(200, 'Cart retrieved successfully', result));
  }

  static async addItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    const item = await CartService.addItem(userId, productId, quantity);

    res
      .status(201)
      .json(new ApiResponse(201, 'Item added successfully', { item }));
  }

  static async getTotal(req: Request, res: Response) {
    const userId = req.user!.id;

    const totals = await CartService.getCartTotal(userId);
    res.json(new ApiResponse(200, 'Totals retrieved successfully', { totals }));
  }

  static async updateItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const result = await CartService.updateQuantity(
      userId,
      productId as string,
      quantity
    );

    res.json(new ApiResponse(200, 'Item updated successfully', result));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.params;

    await CartService.removeItem(userId, productId as string);
    res.json(new ApiResponse(200, 'Item removed successfully'));
  }

  static async clearCart(req: Request, res: Response) {
    const userId = req.user!.id;

    await CartService.clearCart(userId);
    res.json(new ApiResponse(200, 'Cart cleared successfully'));
  }

  static async mergeGuestCart(req: Request, res: Response) {
    const userId = req.user!.id;
    const items = req.body;

    const cart = await CartService.mergeGuestCart(userId, items);
    res.json(new ApiResponse(200, 'Cart merged successfully', { cart }));
  }
}
