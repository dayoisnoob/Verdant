import { apiFetch } from "../apiFetch";

export const applyCouponApi = async (code: string, subtotal: number) => {
  return apiFetch("/api/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
};

export const removeCouponApi = () => {
  return apiFetch("/api/coupons", {
    method: "DELETE",
  });
};
