import { OrdersResponse, SingleOrder } from "@/types";
import { apiFetch } from "../apiFetch";

interface CreateCheckoutSessionInput {
  addressId: string;
  couponCode?: string;
  deliveryNotes?: string;
}

export const createCheckoutSession = async (
  data: CreateCheckoutSessionInput,
) => {
  return apiFetch<{ url: string }>("/api/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify(data),
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

export const getUserOrders = async (
  page = 1,
  limit = 10,
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await apiFetch<OrdersResponse>(`/api/orders?${params}`, {
    method: "GET",
  });

  return res;
};
