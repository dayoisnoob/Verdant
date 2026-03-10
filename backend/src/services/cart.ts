import { eq, and } from 'drizzle-orm';
// import type { NewCartItem } from '../schema/cart.schema';
import { cartsTable, type Cart } from '../models/cart';
import { db } from '../config/db';
import {
  cartItemsTable,
  type CartItem,
  type NewCartItem,
} from '../models/cartItems';
import { CouponController } from '../controllers/coupon';
import { CouponService } from './coupon';
import { ApiError } from '../utils/apiResponse';
import { productsTable } from '../models';

export type CartWithItems = Cart & { items: CartItem[] };
/** Get or create a cart for a user. Always use this — never query carts directly. */

export class CartService {
  static async getCart(userId: string) {
    return await CartService.getOrCreateCart(userId);
  }

  static async addItem(userId: string, productId: string, quantity: number) {
    const cart = await CartService.getOrCreateCart(userId);

    if (!productId) throw new ApiError(400, 'ProductId is required');

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!product) throw new ApiError(404, 'Product not found');

    if (!product.inStock) throw new ApiError(400, 'ProductId is out of stock');

    const payload = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images?.[0]?.url ?? '',
      unit: product.unit,
      farm: product.farm,
      isOrganic: product.isOrganic,
      pricePence: Math.round(parseFloat(product.price) * 100),
      quantity,
    };

    const existing = cart.items.find((i) => i.productId === payload.productId);

    if (existing) {
      const newQty = existing.quantity + (payload.quantity ?? 1);
      return CartService.updateQuantity(userId, existing.productId, newQty);
    }

    const [item] = await db
      .insert(cartItemsTable)
      .values({ ...payload, cartId: cart.id as string })
      .returning();

    return item;
  }

  static async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ) {
    if (quantity <= 0) return CartService.removeItem(userId, itemId);

    const cart = await CartService.getOrCreateCart(userId);

    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity, updatedAt: new Date() })
      .where(
        and(
          eq(cartItemsTable.productId, itemId),
          eq(cartItemsTable.cartId, cart.id as string)
        )
      )
      .returning();

    if (!updated) throw new ApiError(404, 'Cart Item not found');

    return { quantity: updated.quantity };
  }

  static async removeItem(userId: string, productId: string) {
    const cart = await CartService.getOrCreateCart(userId);

    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.cartId, cart.id as string)
        )
      );

    return;
  }

  static async clearCart(userId: string) {
    const cart = await CartService.getOrCreateCart(userId);

    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cart.id as string));

    return { success: true };
  }

  static async mergeGuestCart(
    userId: string,
    guestItems: { productId: string; quantity: number }[]
  ) {
    for (const item of guestItems) {
      await CartService.addItem(userId, item.productId, item.quantity);
    }
    return CartService.getCart(userId);
  }

  static async getCartTotal(userId: string, couponCode?: string) {
    const cart = await CartService.getOrCreateCart(userId);

    const subtotalPence = cart.items.reduce(
      (sum, item) => sum + item.pricePence * item.quantity,
      0
    );

    const result = couponCode
      ? await CouponService.applyCoupon(userId, couponCode, subtotalPence)
      : null;

    const discountPence = Math.min(result?.discount ?? 0, subtotalPence);
    const discountedSubtotal = subtotalPence - discountPence;
    const deliveryPence = discountedSubtotal >= 10000 ? 0 : 499;
    const totalPence = discountedSubtotal + deliveryPence;

    console.log(subtotalPence, discountPence, deliveryPence, totalPence);

    return {
      subtotalPence,
      discountPence,
      deliveryPence,
      totalPence,
      subtotal: (subtotalPence / 100).toFixed(2),
      discount: (discountPence / 100).toFixed(2),
      delivery: (deliveryPence / 100).toFixed(2),
      total: (totalPence / 100).toFixed(2),
      itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
      appliedCoupon: result ? { code: couponCode } : null,
    };
  }

  static async getOrCreateCart(userId: string) {
    const [existing] = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId));

    if (existing) {
      const items = await db
        .select({
          id: cartItemsTable.id,
          productId: cartItemsTable.productId,
          name: cartItemsTable.name,
          slug: cartItemsTable.slug,
          imageUrl: cartItemsTable.imageUrl,
          unit: cartItemsTable.unit,
          farm: cartItemsTable.farm,
          isOrganic: cartItemsTable.isOrganic,
          pricePence: cartItemsTable.pricePence,
          quantity: cartItemsTable.quantity,
        })
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cartId, existing.id));

      return { ...existing, items };
    }

    const [created] = await db
      .insert(cartsTable)
      .values({ userId })
      .returning();

    return { ...created, items: [] };
  }

  static async applyCouponToCart(userId: string, couponCode: string) {
    const cart = await CartService.getOrCreateCart(userId);

    const [updated] = await db
      .update(cartsTable)
      .set({ couponCode, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string))
      .returning();

    if (!updated) {
      throw new ApiError(500, 'Error applying coupon code');
    }
  }

  static async removeCouponFromCart(userId: string) {
    const cart = await CartService.getOrCreateCart(userId);

    await db
      .update(cartsTable)
      .set({ couponCode: null, updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id as string));
  }
}
