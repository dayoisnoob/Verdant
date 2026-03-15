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
  unitPriceCents: string;
  totalPriceCents: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotalCents: number;
  deliveryNotes?: string;
  shippingFee: number;
  stripeSessionId: string;
  customerEmail: string;
  discountAmount: number;
  userId: string;
  totalCents: number;
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

export interface ordersApi {
  orders: AllOrders[];
  pagination: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
}

export interface AllOrders {
  id: string;
  status: string;
  createdAt: Date;
  totalCents: number;
  orderNumber: string;
  items: OrderItems[];
  subtotalCents: number;
}
