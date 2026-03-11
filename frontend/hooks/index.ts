import {
  addToWishlist,
  getUserWishlist,
  logoutApi,
  removeFromWishlist,
} from "@/lib/api";
import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useAuthCart = () => {
  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);

  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0).toFixed(2),
  );

  return { itemCount, totalQuantity, subtotal, isLoading };
};

export const useGuestCart = () => {
  const items = useGuestCartStore((state) => state.items);

  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0).toFixed(2),
  );

  return { itemCount, totalQuantity, subtotal, isLoading: false };
};

export const useCart = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

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

  return async () => {
    await logoutApi();
    logout();
    router.push("/login");
    queryClient.clear();
    clearCart();
  };
};

export const useWishlist = () => {
  const {
    data: wishlist = [],
    isLoading,
    isError: wishlistError,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await getUserWishlist();
      return res.data;
    },
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

    const prev = wishlisted;

    try {
      if (prev) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch {}
  };

  return { wishlisted, toggle };
};
