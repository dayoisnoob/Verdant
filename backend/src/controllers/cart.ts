import type { Request, Response } from 'express';
import { CartService } from '../services/cart';
import { ApiResponse } from '../utils/apiResponse';

export class CartController {
  static async getCart(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await CartService.getCart(userId);
    const message = 'Cart retrieved successfully';

    res.json(new ApiResponse(200, message, result));
  }

  static async addItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    const item = await CartService.addItem(userId, productId, quantity);

    res.json(new ApiResponse(201, 'Item added successfully', item));
  }

  static async getTotal(req: Request, res: Response) {
    const userId = req.user!.id;
    const couponCode = req.query.coupon;

    const total = await CartService.getCartTotal(userId, couponCode as string);
    res.json(new ApiResponse(200, 'Totals retrieved successfully', total));
  }

  static async updateItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { newQuantity } = req.body;

    if (newQuantity === undefined || newQuantity < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'newQuantity must be >= 0' });
    }

    const result = await CartService.updateQuantity(
      userId,
      itemId as string,
      Number(newQuantity)
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
    res.json({ success: true, data: cart });
  }

  static async applyCouponToCart() {
    const cart = await CartService.getOrCreateCart(userId);

    await db
      .update(cartsTable)
      .set({ couponCode, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string));
  }

  // Also clear it when removed
  static async removeCouponFromCart(userId: string) {
    const cart = await CartService.getOrCreateCart(userId);

    await db
      .update(cartsTable)
      .set({ couponCode: null, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string));
  }
}
