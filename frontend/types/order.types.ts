import { Pagination } from "./product.types";

export type FilterStatus =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItems {
  id: string;
  orderId: string;
  image: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPricePence: number;
  totalPricePence: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotalPence: number;
  deliveryNotes?: string;
  shippingFee: number;
  stripeSessionId: string;
  customerEmail: string;
  discountAmount: number;
  userId: string;
  totalPence: number;
  currency?: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone1: string;
    phone2?: string;
    state: string;
    streetAddress: string;
  };
  createdAt: Date;
}

export interface SingleOrder extends CustomerOrder {
  items: OrderItems[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface Order {
  id: string;
  status: string;
  discount: number;
  createdAt: Date;
  shippingFee: number;
  totalPence: number;
  orderNumber: string;
  items: OrderItems[];
  subtotalPence: number;
  totalCount: string;
}

export type OrderStatus = "delivered" | "shipped" | "paid" | "processing";
export type Tab = "overview" | "orders" | "saved" | "addresses" | "settings";
