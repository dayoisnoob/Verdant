"use client";

import { getCart } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/store/store";
import { ApiError } from "@/util";
import { useEffect } from "react";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const { setCart, setLoading, setError } = useCartStore.getState();

    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const rehydrate = async () => {
      try {
        const cart = await getCart();
        setCart(cart);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, [isLoggedIn, isHydrated]);

  return <>{children}</>;
};
