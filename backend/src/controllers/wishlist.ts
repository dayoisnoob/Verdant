import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { WishlistService } from '../services/wishlist';

export class WishlistController {
  static async addItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.query;

    console.log(productId);

    const result = await WishlistService.addItem(userId, productId as string);

    res.json(new ApiResponse(201, result.message, result.newItem));
  }

  static async getItems(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await WishlistService.getItems(userId);

    res.json(new ApiResponse(200, result.message, result.items));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.query;

    const result = await WishlistService.removeItem(
      userId,
      productId as string
    );

    res.json(new ApiResponse(201, result.message));
  }
}
