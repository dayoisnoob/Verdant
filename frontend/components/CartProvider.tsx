"use client";

import { getCart } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/store/store";
import { useEffect } from "react";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    const { setCart, setLoading } = useCartStore.getState();

    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const rehydrate = async () => {
      try {
        const cart = await getCart();
        setCart(cart);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, [isLoggedIn]);

  return <>{children}</>;
};
