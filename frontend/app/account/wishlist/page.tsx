"use client";

import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";

export default function WishlistPage() {
  const { wishlist, isLoading } = useWishlist();

  if (isLoading) return <div>Loading Wishlist</div>;

  return <Wishlist items={wishlist} standalone />;
}
