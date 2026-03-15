import { CartApi, Totals } from "@/types";
import { apiFetch } from "../apiFetch";

export const getCart = async (): Promise<CartApi> => {
  const res = await apiFetch<{ cart: CartApi }>("/api/cart", {
    method: "GET",
  });

  return res.cart;
};

export const getCartTotal = async (): Promise<Totals> => {
  const res = await apiFetch<{ totals: Totals }>("/api/cart/total", {
    method: "GET",
  });

  return res.totals;
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
}): Promise<CartApi> => {
  return apiFetch("/api/cart/items/", {
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
): Promise<CartApi> => {
  return apiFetch("/api/cart/merge", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
