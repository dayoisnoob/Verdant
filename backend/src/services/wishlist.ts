import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { productsTable, wishlistsTable } from '../models';
import { ApiError } from '../utils/apiResponse';

export class WishlistService {
  static async addItem(userId: string, productId: string) {
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

      return { added: false, item: null };
    }

    const [item] = await db
      .insert(wishlistsTable)
      .values({ userId, productId })
      .returning();

    return { added: true, item };
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

    return items;
  }

  static async removeItem(userId: string, productId: string) {
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
      throw new ApiError(404, 'Item not found in wishlist');
    }
  }
}
