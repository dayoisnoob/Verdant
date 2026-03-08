import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { productsTable, wishlistsTable } from '../models';
import { ApiError } from '../utils/apiResponse';

export class WishlistService {
  static async addItem(userId: string, productId: string) {
    if (!productId) {
      throw new ApiError(400, 'Product id is required');
    }

    const [existing] = await db
      .select({ id: wishlistsTable.id })
      .from(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.userId, userId),
          eq(wishlistsTable.productId, productId)
        )
      )
      .limit(1);

    if (existing) {
      await WishlistService.removeItem(userId, productId);

      return {
        message: 'Product successfully removed from wishlist',
        newItem: null,
      };
    }

    const [newItem] = await db
      .insert(wishlistsTable)
      .values({ userId, productId })
      .returning();

    return { message: 'Product successfully added to wishlist', newItem };
  }

  static async getItems(userId: string) {
    const wishlist = await db
      .select()
      .from(wishlistsTable)
      .innerJoin(productsTable, eq(productsTable.id, wishlistsTable.productId))
      .where(eq(wishlistsTable.userId, userId));

    const items = wishlist.map(({ wishlist, products }) => ({
      wishlistId: wishlist.id,
      ...products,
    }));

    return { message: 'Items successfully retrieved', items };
  }

  static async removeItem(userId: string, productId: string) {
    if (!productId) {
      throw new ApiError(400, 'Product id is required');
    }

    const [removedItem] = await db
      .delete(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.userId, userId),
          eq(wishlistsTable.productId, productId)
        )
      )
      .returning();

    if (!removedItem) {
      throw new ApiError(500, 'Item not found in wishlist');
    }

    return {
      message: 'Product successfully removed from wishlist',
    };
  }
}
