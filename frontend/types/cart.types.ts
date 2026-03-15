import { Product } from "./product.types";

export interface GuestCart {
  product: Product;
  quantity: number;
}

export interface CartItems {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  unit: string;
  farm: string;
  isOrganic: boolean;
  pricePence: number;
  quantity: number;
}

export interface CartApi {
  id: string;
  userId: string;
  couponCode: string;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    unit: string;
    farm: string;
    isOrganic: boolean;
    pricePence: number;
    quantity: number;
  }[];
}

export interface Totals {
  subtotalPence: number;
  discountPence: number;
  deliveryPence: number;
  totalPence: number;
  subtotal: string;
  discount: string;
  delivery: string;
  total: string;
  itemCount: number;
}
