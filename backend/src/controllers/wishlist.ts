import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { WishlistService } from '../services/wishlist';

export class WishlistController {
  static async addItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.params;

    const result = await WishlistService.addItem(userId, productId as string);

    res
      .status(201)
      .json(
        new ApiResponse(
          result.added ? 201 : 200,
          result.added
            ? 'Item added to wishlist'
            : 'Item removed from wishlist',
          { item: result.item }
        )
      );
  }

  static async getItems(req: Request, res: Response) {
    const userId = req.user!.id;

    const items = await WishlistService.getItems(userId);

    res.json(new ApiResponse(200, 'Wishlist retrieved', { items }));
  }

  static async removeItem(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.params;

    await WishlistService.removeItem(userId, productId as string);

    res.json(new ApiResponse(200, 'Item removed from wishlist'));
  }
}
