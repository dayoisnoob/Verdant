import {} from "@/types";
import { apiFetch } from "../apiFetch";
import { CartItemApi, CartResponse, TotalsResponse } from "@/types/cart.types";

export interface GetCartResponse {
  cart: CartResponse;
  totals: TotalsResponse;
}

export const getCart = async (): Promise<GetCartResponse> => {
  const res = await apiFetch<{ cart: CartResponse; totals: TotalsResponse }>(
    "/api/cart",
    {
      method: "GET",
    },
  );

  return res;
};

export const updateItem = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) => {
  return apiFetch(`/api/cart/items/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
};

export const addItemToCart = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemApi> => {
  return apiFetch("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const removeItemFromCart = async (productId: string) => {
  return apiFetch(`/api/cart/items/${productId}`, {
    method: "DELETE",
  });
};

export const mergeGuestCart = async (
  data: {
    productId: string;
    quantity: number;
  }[],
): Promise<CartResponse> => {
  return apiFetch("/api/cart/merge", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
