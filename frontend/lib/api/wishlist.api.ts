import { WishlistApi } from "@/types";
import { apiFetch } from "../apiFetch";

export const addToWishlist = async (
  productId: string,
): Promise<WishlistApi> => {
  return apiFetch(`/api/wishlist/${productId}`, {
    method: "POST",
  });
};

export const getUserWishlist = async (): Promise<WishlistApi[]> => {
  const res = await apiFetch<{ items: WishlistApi[] }>(`/api/wishlist`, {
    method: "GET",
  });

  return res.items;
};

export const removeFromWishlist = async (productId: string) => {
  return apiFetch(`/api/wishlist/${productId}`, {
    method: "DELETE",
  });
};
