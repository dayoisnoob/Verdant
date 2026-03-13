import type { Request, Response } from 'express';
import { CartService } from '../services/cart';
import { ApiError, ApiResponse } from '../utils/apiResponse';

export class CartController {
  static async getCart(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await CartService.getCart(userId);

    res.json(new ApiResponse(200, 'Cart retrieved successfully', result));
  }

  static async addItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) throw new ApiError(400, 'ProductId is required');

    const item = await CartService.addItem(userId, productId, Number(quantity));

    res.json(new ApiResponse(201, 'Item added successfully', { item }));
  }

  static async getTotal(req: Request, res: Response) {
    const userId = req.user!.id;

    const totals = await CartService.getCartTotal(userId);
    res.json(new ApiResponse(200, 'Totals retrieved successfully', { totals }));
  }

  static async updateItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      throw new ApiError(400, 'New quantity must be >= 0');
    }

    const result = await CartService.updateQuantity(
      userId,
      itemId as string,
      Number(quantity)
    );

    res.json(new ApiResponse(200, 'Item updated successfully', result));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { itemId } = req.params;

    await CartService.removeItem(userId, itemId as string);
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

    if (!Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, message: 'items must be an array' });
    }

    const cart = await CartService.mergeGuestCart(userId, items);
    res.json({ success: true, data: { cart } });
  }
}
