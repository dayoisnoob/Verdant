import { Product } from "./product.types";

export interface GuestCart {
  product: Product;
  quantity: number;
}

export interface StoreCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  unit: string;
  stock: number;
  farm: string;
  isOrganic: boolean;
  pricePence: number;
  quantity: number;
}

export interface CartResponse {
  id: string;
  userId: string;
  couponCode: string;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  items: StoreCartItem[];
}

export interface TotalsResponse {
  subtotalPence: number;
  discountPence: number;
  deliveryPence: number;
  totalPence: number;
}

export interface CartItemApi extends StoreCartItem {
  cartId: string;
  createdAt: Date;
  updatedAt: Date;
}
