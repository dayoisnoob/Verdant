"use client";

import {
  addToWishlist,
  getAllProducts,
  getUserOrders,
  getUserWishlist,
  logout as logoutApi,
} from "@/lib/api";
import { DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { FilterStatus } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const useCart = (discount: number = 0) => {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useGuestCartStore((state) => state.isHydrated);
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);

  const authCart = useCartStore();
  const guestCart = useGuestCartStore();

  const activeCart = user ? authCart : guestCart;

  const itemsQuantity = activeCart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const isLoading = !isAuthHydrated
    ? true
    : user
      ? authCart.isLoading
      : !guestCart.isHydrated;

  const subtotal = activeCart.items.reduce(
    (sum, i) => sum + i.pricePence * i.quantity,
    0,
  );
  const discounted = subtotal - discount;
  const delivery = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = discounted + delivery;

  return {
    items: activeCart.items,
    subtotal,
    delivery,
    total,
    isLoading,
    isHydrated,
    subtotalFormatted: (subtotal / 100).toFixed(2),
    deliveryFormatted: (delivery / 100).toFixed(2),
    totalFormatted: (total / 100).toFixed(2),
    itemsQuantity,
    addItem: activeCart.addItem,
    removeItem: activeCart.removeItem,
    updateQuantity: activeCart.updateQuantity,
    clearCart: activeCart.clearCart,
  };
};

export const useAllProducts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: () => getAllProducts(),
  });
  return { data, isLoading };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return async () => {
    await logoutApi();
    useAuthStore.getState().logout();
    queryClient.clear();
    window.location.replace("/login");
  };
};

export const useWishlist = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);

  const {
    data: wishlist = [],
    isLoading: isQueryLoading,
    isError: wishlistError,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: ["wishlist"],
    enabled: !!user,
    queryFn: getUserWishlist,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = !isAuthHydrated ? true : !!user && isQueryLoading;

  return { wishlist, isLoading, wishlistError, refetchWishlist };
};

export const useWishlistToggle = (productId: string) => {
  const { wishlist } = useWishlist();
  const queryClient = useQueryClient();
  const wishlisted = wishlist.some((l) => l.id === productId);

  const [isToggling, setIsToggling] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsToggling(true);

      await addToWishlist(productId);
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Wishlist updated");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsToggling(false);
    }
  };

  return { wishlisted, toggle, isToggling };
};

export const useOrders = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getUserOrders(),
  });
  const orders = data?.orders ?? [];
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    orders,
    filtered,
    counts,
    filter,
    setFilter,
    isLoading,
    isError,
    refetch,
  };
};
