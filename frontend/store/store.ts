import {
  addItemToCartApi,
  getCart,
  removeCouponApi,
  removeItemFromCartApi,
} from "@/lib/api";
import {
  AddressStore,
  AdminUser,
  AuthCartStore,
  AuthStore,
  CartItems,
  GuestCartStore,
  Product,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<AuthCartStore>((set, get) => ({
  items: [],
  couponCode: "",
  discount: 0,
  isLoading: true,
  isError: false,

  addItem: async (product, quantity = 1) => {
    const existing = get().items.find((i) => i.productId === product.id);

    if (existing) {
      get().updateQuantity(product.id, quantity);
    } else {
      set((state) => ({
        items: [
          ...state.items,
          {
            id: crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl: product.images[0].url,
            unit: product.unit,
            farm: product.farm,
            isOrganic: product.isOrganic,
            pricePence: Math.round(parseFloat(product.price) * 100),
            quantity,
          },
        ],
      }));
    }

    try {
      await addItemToCartApi({ productId: product.id, quantity });
    } catch (err) {
      console.log(err);
      set((state) => ({
        items: state.items.filter((i) => i.productId !== product.id),
      }));
    }
  },

  setCart: (cart) =>
    set({
      items: cart.items,
      couponCode: cart.couponCode ?? "",
      discount: cart.discount,
    }),

  removeItem: async (id: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== id),
    }));

    try {
      await removeItemFromCartApi(id);
    } catch {
      const cart = await getCart();
      useCartStore.getState().setCart(cart);
    }
  },

  clearCart: () => set({ items: [] }),

  updateQuantity: (id: string, quantity: number) => {
    set((state) => {
      const item = state.items.find((i) => i.productId === id);
      if (!item) return {};

      const newQuantity = item.quantity + quantity;

      if (newQuantity < 1) return {};

      return {
        items: state.items.map((i) =>
          i.productId === id ? { ...i, quantity: newQuantity } : i,
        ),
      };
    });
  },

  applyCoupon: (code: string, discount: number) =>
    set({ couponCode: code, discount }),

  removeCoupon: async () => {
    set({ couponCode: "", discount: 0 });

    try {
      await removeCouponApi();
    } catch (err) {
      console.log(err);
    }
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  setLoading: (val: boolean) => set({ isLoading: val }),
  setError: (val: boolean) => set({ isError: val }),
}));

export const useGuestCartStore = create(
  persist<GuestCartStore>(
    (set, get) => ({
      items: [],
      couponCode: "",
      discount: 0,

      // Accepts a Product but stores it flat — same shape as CartItems
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }

          const item: CartItems = {
            id: crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl: product.images[0].url,
            unit: product.unit,
            farm: product.farm,
            isOrganic: product.isOrganic,
            pricePence: Math.round(parseFloat(product.price) * 100),
            quantity,
          };

          return { items: [...state.items, item] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      updateQuantity: (id: string, quantity: number) => {
        set((state) => {
          const item = state.items.find((i) => i.productId === id);
          if (!item) return state;

          const newQuantity = item.quantity + quantity;

          if (newQuantity < 1) return state;

          return {
            items: state.items.map((i) =>
              i.productId === id ? { ...i, quantity: newQuantity } : i,
            ),
          };
        });
      },

      applyCoupon: (code: string, discount: number) =>
        set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: "", discount: 0 }),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "guest-cart" },
  ),
);

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      accessToken: null,
      signUpEmail: "",

      setEmail: (email: string) => set({ signUpEmail: email }),

      login: (user, accessToken) =>
        set({ user, accessToken, isLoggedIn: true }),

      setUser: (data) => set({ user: data }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => set({ user: null, isLoggedIn: false, accessToken: null }),
    }),
    { name: "verdant" },
  ),
);

interface AdminStore {
  admin: AdminUser | null;
  accessToken: string | null;
  login: (admin: AdminUser, accessToken: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  admin: null,
  accessToken: null,
  login: (admin, accessToken) => set({ admin, accessToken }),
  logout: () => set({ admin: null, accessToken: null }),
}));

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      selectedAddressId: null,

      setAddressId: (id) => {
        set({ selectedAddressId: id });
      },
    }),
    {
      name: "address-storage",
    },
  ),
);
