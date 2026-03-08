// providers/CartProvider.tsx
"use client";

import { getCart } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/store/store";
import { useEffect } from "react";
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    const rehydrate = async () => {
      const cart = await getCart();
      useCartStore.getState().setCart(cart.data.items);
    };

    rehydrate();
  }, [isLoggedIn]);

  return <>{children}</>;
};
