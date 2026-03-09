import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import {
  Address,
  AllOrders,
  ApiResponse,
  CartApi,
  OrderSession,
  // OrderSession,
  Product,
  ProductsApiResponse,
  SingleOrder,
  Totals,
  UserApi,
  UserData,
  WishlistApi,
} from "@/types";
import { handleApiError } from "@/util";
import { AddressFormData, RegistrationForm } from "@/validations";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "${BASE_URL}";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
}

// ----------------------------------------------------------------------------------------------
// ------------------------------------------AUTH  API----------------------------------------
// ----------------------------------------------------------------------------------------------

export const login = async (data: Login) => {
  const user = await apiFetch<UserApi>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  useAuthStore.getState().login(user.data, user.accessToken);

  const guestItems = useGuestCartStore.getState().items;

  await mergeGuestCart(guestItems);
  useGuestCartStore.getState().clearCart();

  const cart = await getCart();
  useCartStore.getState().setCart(cart.data);
};

export const registerApi = async (data: RegistrationForm) => {
  await apiFetch(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const verifyEmail = async (token: string) => {
  return apiFetch<{ message: string }>(`/api/auth/verify-email?token=${token}`);
};

export const logoutApi = async () => {
  await apiFetch("/api/auth/logout", { method: "POST" });

  useAuthStore.getState().logout();
};

export const forgotPassword = async (email: string) => {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (
  token: string,
  data: {
    newPassword: string;
    confirmNewPassword: string;
  },
) => {
  return apiFetch(`/api/auth/reset-password?token=${token}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const resendVerificationEmail = async (email: string) => {
  return apiFetch("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const updateProfile = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
}): Promise<ApiResponse<UserData>> => {
  return apiFetch("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  return apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export interface Login {
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
}

// ----------------------------------------------------------------------------------------------
// ------------------------------------------CART  API----------------------------------------
// ----------------------------------------------------------------------------------------------

export const getCart = async (): Promise<ApiResponse<CartApi>> => {
  return apiFetch<ApiResponse<CartApi>>("/api/cart", {
    method: "GET",
  });
};

export const getCartTotal = async (
  couponCode: string,
): Promise<ApiResponse<Totals>> => {
  return apiFetch(`/api/cart/total?coupon=${couponCode}`, {
    method: "GET",
  });
};

export const updateItem = async ({
  itemId,
  newQuantity,
}: {
  itemId: string;
  newQuantity: number;
}): Promise<ApiResponse<CartApi>> => {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ newQuantity }),
  });
};

export const addItemToCartApi = async ({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<ApiResponse<CartApi>> => {
  return apiFetch("/api/cart/items/", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const removeItemFromCartApi = async (
  productId: string,
): Promise<ApiResponse<CartApi>> => {
  return apiFetch(`/api/cart/items/${productId}`, {
    method: "DELETE",
  });
};

export const mergeGuestCart = async (
  data: {
    productId: string;
    quantity: number;
  }[],
): Promise<ApiResponse<CartApi>> => {
  return apiFetch("/api/cart/merge", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const applyCouponApi = async (
  couponCode: string,
): Promise<ApiResponse<CartApi>> => {
  return apiFetch(`/api/cart/coupon?coupon=${couponCode}`, {
    method: "PATCH",
  });
};

// ----------------------------------------------------------------------------------------------
// ------------------------------------------ADDRESS  API----------------------------------------
// ----------------------------------------------------------------------------------------------

interface AddAddress {
  firstName: string;
  lastName?: string;
  streetAddress: string;
  phone1: string;
  phone2?: string;
  state: string;
}

export const addUserAddress = async (
  data: AddAddress,
): Promise<ApiResponse<Address>> => {
  console.log(data);
  return apiFetch("/api/address", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getUserAddresses = async (): Promise<ApiResponse<Address[]>> => {
  return apiFetch("/api/address", {
    method: "GET",
  });
};

export const setDefaultAddress = async (
  addressId: string,
): Promise<ApiResponse<Address[]>> => {
  return apiFetch(`/api/address/${addressId}/set-default`, {
    method: "PATCH",
  });
};

export const updateUserAddresses = async ({
  addressId,
  data,
}: {
  addressId: string;
  data: AddressFormData;
}): Promise<ApiResponse<null>> => {
  return apiFetch(`/api/address?addressId=${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const removeAddress = async (
  addressId: string,
): Promise<ApiResponse<null>> => {
  return apiFetch(`/api/address?addressId=${addressId}`, {
    method: "DELETE",
  });
};

// ----------------------------------------------------------------------------------------------
// ------------------------------------------WISHLIST  API----------------------------------------
// ----------------------------------------------------------------------------------------------

export const addToWishlist = async (
  productId: string,
): Promise<ApiResponse<WishlistApi>> => {
  return apiFetch(`/api/wishlist?productId=${productId}`, {
    method: "POST",
  });
};

export const getUserWishlist = async (): Promise<
  ApiResponse<WishlistApi[]>
> => {
  return apiFetch(`/api/wishlist`, {
    method: "GET",
  });
};

export const removeFromWishlist = async (productId: string) => {
  return apiFetch(`/api/wishlist?productId=${productId}`, {
    method: "DELETE",
  });
};

// ----------------------------------------------------------------------------------------------
// ------------------------------------------ORDERS  API----------------------------------------
// ----------------------------------------------------------------------------------------------

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
  return apiFetch<{ data: { url: string } }>(
    "/api/payments/create-checkout-session",
    {
      method: "POST",
      body: JSON.stringify({
        items,
        shippingFee,
        addressId,
        discount,
        couponCode,
        deliveryNotes,
      }),
    },
  );
};

export const getOrderBySessionId = async (
  sessionId: string,
): Promise<ApiResponse<OrderSession>> => {
  return apiFetch(`/api/orders/session/${sessionId}`, {
    method: "GET",
  });
};

export const getOrderById = async (
  id: string,
): Promise<ApiResponse<SingleOrder>> => {
  return apiFetch(`/api/orders/${id}`, {
    method: "GET",
  });
};

export const getuserOrders = (
  page = 1,
  limit = 10,
): Promise<ApiResponse<AllOrders[]>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  return apiFetch(`/api/orders?${params}`, {
    method: "GET",
  });
};

// ----------------------------------------------------------------------------------------------
// ------------------------------------------PRODUCTS  API----------------------------------------
// ----------------------------------------------------------------------------------------------

export const getProducts = (
  category?: string,
  sort?: string,
  page = 1,
  limit = 8,
): Promise<ProductsApiResponse> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (sort && sort !== "default") params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return apiFetch(`/api/products?${params.toString()}`, {
    method: "GET",
  });
};

export const getProductBySlug = (
  slug: string,
): Promise<ApiResponse<Product>> => {
  return apiFetch(`/api/products/${slug}`, {
    method: "GET",
  });
};

// ----------------------------------------------------------------------------------------------
// ------------------------------------------COUPONS  API----------------------------------------
// ----------------------------------------------------------------------------------------------

export const applyCoupon = (
  code: string,
  subtotal: number,
): Promise<ApiResponse<Coupon>> => {
  return apiFetch(`/api/coupons?code=${code}&subtotal=${subtotal}`, {
    method: "GET",
  });
};

interface Coupon {
  discountAmount: number;
}
