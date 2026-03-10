"use client";

import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";
import { useAuthStore } from "@/store/store";
import { redirect } from "next/navigation";

export default function WishlistPage() {
  const { wishlist, isLoading } = useWishlist();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    redirect("/login?redirect=/orders");
  }

  if (isLoading) return <div>Loading Wishlist</div>;

  return <Wishlist items={wishlist} standalone />;
}
