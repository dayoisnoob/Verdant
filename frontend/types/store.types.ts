import { UserData } from "./auth.types";
import { CartResponse, StoreCartItem, TotalsResponse } from "./cart.types";
import { ProductCard } from "./product.types";

export interface AuthCartStore {
  items: StoreCartItem[];
  totals: TotalsResponse | null;
  isLoading: boolean;
  isError: boolean;

  addItem: (product: ProductCard, quantity?: number) => void;
  setCart: (cart: CartResponse, totals: TotalsResponse) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, delta: number) => void;
  setIsLoading: (state: boolean) => void;
}

export interface GuestCartStore {
  items: StoreCartItem[];

  addItem: (product: ProductCard, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: () => number;
}

export interface EmailStore {
  email: string | null;
  setEmail: (email: string) => void;
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
  accessToken: string | null;
  isHydrated: boolean;

  updateUser: (user: UserData) => void;
  setAccessToken: (token: string) => void;
  login: (user: UserData, accessToken: string) => void;
  logout: () => void;
  setHydrated: () => void;
}
