import { addToWishlist, getUserWishlist, logoutApi } from "@/lib/api";
import { useAuthStore, useCartStore, useGuestCartStore } from "@/store/store";
import { CartItems } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const cartStats = (items: CartItems[]) => ({
  itemCount: items.length,
  totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: Number(
    items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0).toFixed(2),
  ),
});

export const useCart = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const authUserCart = useCartStore();
  const guestUserCart = useGuestCartStore();

  const cart = isLoggedIn ? authUserCart : guestUserCart;
  const stats = cartStats(cart.items);

  return {
    ...stats,
    items: cart.items,
    isLoading: !isHydrated || (isLoggedIn ? authUserCart.isLoading : false),
    cartError: isLoggedIn ? authUserCart.isError : false,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    couponCode: cart.couponCode,
    discount: cart.discount,
    clearCart: cart.clearCart,
    applyCoupon: cart.applyCoupon,
    removeCoupon: cart.removeCoupon,
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);
  return async () => {
    logout();
    clearCart();
    queryClient.clear();

    window.location.replace("/login");

    logoutApi();
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
      toast.success("Wishlist updated successfully");
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }

    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
  };

  return { wishlisted, toggle };
};
