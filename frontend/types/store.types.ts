import { UserData } from "./auth.types";
import { CartApi, CartItems } from "./cart.types";
import { ProductCard } from "./product.types";

export interface AuthCartStore {
  items: CartItems[];
  couponCode: string;
  discount: number;
  isLoading: boolean;
  isError: boolean;

  addItem: (product: ProductCard, quantity?: number) => void;
  setCart: (cartItems: CartApi) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
  setLoading: (val: boolean) => void;
  setError: (val: boolean) => void;
}

export interface GuestCartStore {
  items: CartItems[];
  couponCode: string;
  discount: number;

  addItem: (product: ProductCard, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
}

export interface AddressStore {
  selectedAddressId: string | null;
  setAddressId: (id: string) => void;
}

export interface AuthStore {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: Date;
  } | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  signUpEmail: string;
  isHydrated: boolean;

  setEmail: (email: string) => void;
  setUser: (user: UserData) => void;
  setAccessToken: (token: string) => void;
  login: (user: UserData, accessToken: string) => void;
  logout: () => void;
  setHydrated: () => void;
}
