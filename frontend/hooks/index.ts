import { addToWishlist, getUserWishlist, refreshAccessToken } from "@/lib/api";
import { DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useCart = () => {
  const user = useAuthStore((state) => state.user);

  const authUserCart = useCartStore();
  const guestUserCart = useGuestCartStore();

  const cart = user ? authUserCart : guestUserCart;
  const itemsQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.pricePence * i.quantity,
    0,
  );
  const delivery = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  return {
    items: cart.items,
    subtotal,
    delivery,
    total,
    subtotalFormatted: (subtotal / 100).toFixed(2),
    deliveryFormatted: (delivery / 100).toFixed(2),
    totalFormatted: (total / 100).toFixed(2),
    itemsQuantity,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
  };
};

export const useCheckoutTotals = (discount: number = 0) => {
  const items = useCartStore((state) => state.items);

  const subtotal = items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0);
  const discounted = subtotal - discount;
  const delivery = discounted >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = discounted + delivery;

  return {
    subtotal,
    delivery,
    total,
    subtotalFormatted: (subtotal / 100).toFixed(2),
    deliveryFormatted: (delivery / 100).toFixed(2),
    totalFormatted: (total / 100).toFixed(2),
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  return async () => {
    logout();
    queryClient.clear();
    window.location.replace("/login");
  };
};

export const useWishlist = () => {
  const user = useAuthStore((state) => state.user);

  const {
    data: wishlist = [],
    isLoading,
    isError: wishlistError,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: ["wishlist"],
    enabled: !!user,
    queryFn: getUserWishlist,
    staleTime: 1000 * 60 * 5,
  });

  return { wishlist, isLoading, wishlistError, refetchWishlist };
};

export const useWishlistToggle = (productId: string) => {
  const { wishlist } = useWishlist();
  const queryClient = useQueryClient();
  const wishlisted = wishlist.some((l) => l.id === productId);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToWishlist(productId);
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Wishlist updated");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return { wishlisted, toggle };
};

export const useAppReady = () => {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      Promise.resolve().then(() => setTokenReady(true));
      return;
    }

    refreshAccessToken()
      .then(() => setTokenReady(true))
      .catch(() => setTokenReady(true));
  }, [isHydrated, user]);

  return isHydrated && tokenReady;
};
