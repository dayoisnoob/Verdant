import { apiFetch } from "../apiFetch";

export const applyCoupon = async (
  code: string,
  subtotal: number,
): Promise<ApplyCouponResponse> => {
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

interface ApplyCouponResponse {
  applied: boolean;
  discount: number;
}
