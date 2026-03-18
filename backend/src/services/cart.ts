import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { productsTable } from '../models';
import { cartsTable, type Cart } from '../models/cart';
import { cartItemsTable, type CartItem } from '../models/cartItems';
import { ApiError } from '../utils/apiResponse';
import { CouponService } from './coupon';

type CartWithItems = Cart & { items: CartItem[] };
export class CartService {
  static async getCart(userId: string) {
    const { cart } = await CartService.getOrCreateCart(userId);
    const totals = await CartService.getCartTotal(
      userId,
      cart as CartWithItems
    );

    return { cart, totals };
  }

  static async addItem(
    userId: string,
    productId: string,
    quantity: number,
    existingCart?: CartWithItems
  ) {
    const { cart } = existingCart
      ? { cart: existingCart }
      : await CartService.getOrCreateCart(userId);

    const [product] = await db
      .select()
      .from(productsTable)
      .where(
        and(eq(productsTable.id, productId), eq(productsTable.inStock, true))
      );

    if (!product)
      throw new ApiError(404, 'Product not found or is out of stock');

    const payload = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images?.[0]?.url ?? '',
      unit: product.unit,
      farm: product.farm,
      stock: product.stock,
      inStock: product.inStock,
      isOrganic: product.isOrganic,
      pricePence: product.price,
      quantity,
    };

    const existing = cart.items.find((i) => i.productId === payload.productId);

    if (existing) {
      const MAX_QTY = 10;
      const newQty = Math.min(
        existing.quantity + (payload.quantity ?? 1),
        MAX_QTY
      );
      return CartService.updateQuantity(
        userId,
        existing.productId,
        newQty,
        existingCart
      );
    }

    const [item] = await db
      .insert(cartItemsTable)
      .values({ ...payload, cartId: cart.id as string })
      .returning();

    return item;
  }

  static async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
    existingCart?: CartWithItems
  ) {
    const { cart } = existingCart
      ? { cart: existingCart }
      : await CartService.getOrCreateCart(userId);

    if (quantity === 0) return;
    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity, updatedAt: new Date() })
      .where(
        and(
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.cartId, cart.id as string)
        )
      )
      .returning();

    if (!updated) throw new ApiError(404, 'Cart Item not found');

    const { subtotalPence, discountPence } = await CartService.getCartTotal(
      userId,
      existingCart
    );

    if (Number(discountPence) > 0 && subtotalPence <= discountPence) {
      await CouponService.removeCouponFromCart(userId);

      throw new ApiError(
        409,
        'Discount value needs to be higher than your subtotal'
      );
    }

    return { quantity: updated.quantity };
  }

  static async removeItem(userId: string, productId: string) {
    const [removed] = await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.productId, productId),
          eq(
            cartItemsTable.cartId,
            db
              .select({ id: cartsTable.id })
              .from(cartsTable)
              .where(eq(cartsTable.userId, userId))
              .limit(1)
          )
        )
      )
      .returning({ id: cartItemsTable.id });

    if (!removed) throw new ApiError(404, 'Cart item not found');
  }

  static async clearCart(userId: string) {
    await db
      .delete(cartItemsTable)
      .where(
        eq(
          cartItemsTable.cartId,
          db
            .select({ id: cartsTable.id })
            .from(cartsTable)
            .where(eq(cartsTable.userId, userId))
            .limit(1)
        )
      );
  }

  static async mergeGuestCart(
    userId: string,
    guestItems: { productId: string; quantity: number }[]
  ) {
    await Promise.all(
      guestItems.map((item) =>
        CartService.addItem(userId, item.productId, item.quantity)
      )
    );
    return CartService.getCart(userId);
  }

  static async getCartTotal(userId: string, existingCart?: CartWithItems) {
    const { cart } = existingCart
      ? { cart: existingCart }
      : await CartService.getOrCreateCart(userId);

    const subtotalPence = cart.items.reduce(
      (sum, item) => sum + item.pricePence * item.quantity,
      0
    );

    const couponDiscount = cart.discount;

    const discountPence = Math.min(couponDiscount ?? 0, subtotalPence);
    const discountedSubtotal = subtotalPence - discountPence;
    const deliveryPence = discountedSubtotal >= 4000 ? 0 : 499;
    const totalPence = discountedSubtotal + deliveryPence;

    return {
      subtotalPence,
      discountPence,
      deliveryPence,
      totalPence,
      // itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
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
          stock: cartItemsTable.stock,
          inStock: cartItemsTable.inStock,
          isOrganic: cartItemsTable.isOrganic,
          pricePence: cartItemsTable.pricePence,
          quantity: cartItemsTable.quantity,
        })
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cartId, existing.id));

      return { cart: { ...existing, items } };
    }

    const [created] = await db
      .insert(cartsTable)
      .values({ userId })
      .returning();

    return { cart: { ...created, items: [] } };
  }
}
