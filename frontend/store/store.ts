import { addItemToCartApi, getCart, removeItemFromCartApi } from "@/lib/api";
import {
  AddressStore,
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

  addItem: async (product, quantity = 1) => {
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

    try {
      await addItemToCartApi({ productId: product.id, quantity });
    } catch {
      set((state) => ({
        items: state.items.filter((i) => i.productId !== product.id),
      }));
    }
  },

  setCart: (cart) =>
    set({ items: cart.items, couponCode: cart.couponCode ?? "" }),

  removeItem: async (id: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== id),
    }));

    try {
      await removeItemFromCartApi(id);
    } catch {
      const cart = await getCart();
      useCartStore.getState().setCart(cart.data);
    }
  },

  clearCart: () => set({ items: [] }),

  updateQuantity: (id: string, quantity: number) => {
    set((state) => {
      const item = state.items.find((i) => i.productId === id);
      if (!item) return state;

      const newQuantity = item.quantity + quantity;

      if (newQuantity < 1) {
        return { items: state.items.filter((i) => i.productId !== id) };
      }

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

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
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

          if (newQuantity < 1) {
            return { items: state.items.filter((i) => i.productId !== id) };
          }

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

      logout: () => set({ user: null, isLoggedIn: false, accessToken: null }),
    }),
    { name: "be-bold" },
  ),
);

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
