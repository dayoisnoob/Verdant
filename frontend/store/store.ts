import { addItemToCart, removeItemFromCart, updateItem } from "@/lib/api";
import { toPence } from "@/lib/utils";
import {
  AddressStore,
  AuthCartStore,
  AuthStore,
  GuestCartStore,
} from "@/types";
import { StoreCartItem } from "@/types/cart.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<AuthCartStore>((set, get) => ({
  items: [],
  totals: null,
  isLoading: true,
  isError: false,

  addItem: async (product, quantity = 1) => {
    const previousItems = get().items;
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
            pricePence: toPence(product.price),
            quantity,
          },
        ],
      }));
    }

    try {
      await addItemToCart({ productId: product.id, quantity });
    } catch {
      set({ items: previousItems });
    }
  },

  setCart: (cart, totals) =>
    set({
      items: cart.items,
      totals: totals,
      isLoading: false,
    }),

  removeItem: async (id: string) => {
    const previousItems = get().items;
    set((state) => ({
      items: state.items.filter((i) => i.productId !== id),
    }));

    try {
      await removeItemFromCart(id);
    } catch {
      set({ items: previousItems });
    }
  },

  clearCart: () => set({ items: [] }),

  updateQuantity: async (id: string, quantity: number) => {
    const previousItems = get().items;

    const item = previousItems.find((i) => i.productId === id);
    if (!item) return {};

    const newQuantity = item.quantity + quantity;

    if (newQuantity < 1) return {};

    set((state) => {
      return {
        items: state.items.map((i) =>
          i.productId === id ? { ...i, quantity: newQuantity } : i,
        ),
      };
    });

    try {
      await updateItem({ productId: id, quantity: item.quantity });
    } catch {
      set({ items: previousItems });
    }
  },
}));

export const useGuestCartStore = create(
  persist<GuestCartStore>(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
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

          const item: StoreCartItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl: product.images[0].url,
            unit: product.unit,
            farm: product.farm,
            isOrganic: product.isOrganic,
            pricePence: toPence(product.price),
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
      accessToken: null,
      isHydrated: false,

      login: (user, accessToken) => set({ user, accessToken }),

      updateUser: (user) => set({ user }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => {
        set({ user: null, accessToken: null });
        useCartStore.getState().clearCart();
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
