"use client";

import { getCart } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/store/store";
import { ApiError } from "@/util";
import { useEffect } from "react";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const setIsLoading = useCartStore((state) => state.setIsLoading);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const rehydrate = async () => {
      try {
        const { cart, totals } = await getCart();
        useCartStore.getState().setCart(cart, totals);
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("Cart rehydration failed", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    rehydrate();
  }, [setIsLoading, user]);

  return <>{children}</>;
};
