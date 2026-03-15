import { ordersApi, SingleOrder } from "@/types";
import { apiFetch } from "../apiFetch";

export const createCheckoutSession = async ({
  items,
  shippingFee,
  addressId,
  discount,
  couponCode,
  deliveryNotes,
}: {
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
    productId: string;
  }[];

  shippingFee: number;
  addressId: string;
  discount?: number;
  couponCode?: string;
  deliveryNotes?: string;
}) => {
  return apiFetch<{ url: string }>("/api/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({
      items,
      shippingFee,
      addressId,
      discount,
      couponCode,
      deliveryNotes,
    }),
  });
};

export const getOrderBySessionId = async (sessionId: string) => {
  const res = await apiFetch<{ orderNumber: string }>(
    `/api/orders/session/${sessionId}`,
    {
      method: "GET",
    },
  );
  return res.orderNumber;
};

export const getOrderById = async (id: string) => {
  const res = await apiFetch<{ order: SingleOrder }>(`/api/orders/${id}`, {
    method: "GET",
  });

  return res.order;
};

export const getuserOrders = async (
  page = 1,
  limit = 10,
): Promise<ordersApi> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  return apiFetch(`/api/orders?${params}`, {
    method: "GET",
  });
};
