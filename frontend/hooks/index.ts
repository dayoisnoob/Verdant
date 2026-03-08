import { addToWishlist, getUserWishlist, removeFromWishlist } from "@/lib/api";
import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useAuthCart = () => {
  const items = useCartStore((state) => state.items);

  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0).toFixed(2),
  );

  return { itemCount, totalQuantity, subtotal };
};

export const useGuestCart = () => {
  const items = useGuestCartStore((state) => state.items);

  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0).toFixed(2),
  );

  return { itemCount, totalQuantity, subtotal };
};

// hooks/useCart.ts
export const useCart = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  console.log(isLoggedIn);

  const authCart = useAuthCart();
  const guestCart = useGuestCart();
  const authActions = useCartStore();
  const guestActions = useGuestCartStore();

  const cart = isLoggedIn ? authCart : guestCart;
  const actions = isLoggedIn ? authActions : guestActions;

  return { ...cart, ...actions };
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    logout();
    router.push("/login");
    queryClient.clear();
    clearCart();
  };
};

export const useWishlist = () => {
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await getUserWishlist();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // treat as fresh for 5 mins
  });

  return { wishlist, isLoading };
};

// hooks/useWishlistToggle.ts
export const useWishlistToggle = (productId: string, isWishlisted: boolean) => {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const wishlisted = optimistic !== null ? optimistic : isWishlisted;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prev = wishlisted;
    setOptimistic(!wishlisted);
    setLoading(true);

    try {
      if (prev) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setOptimistic(null);
    } catch {
      setOptimistic(null);
    } finally {
      setLoading(false);
    }
  };

  return { wishlisted, toggle, loading };
};
