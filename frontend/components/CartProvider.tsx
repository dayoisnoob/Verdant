"use client";

import { getCart } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/store/store";
import { ApiError } from "@/util";
import { useEffect, useState } from "react";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [user]);

  if (isLoading) return null;

  return <>{children}</>;
};
