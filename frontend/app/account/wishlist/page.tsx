"use client";

import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";
import { useAuthStore } from "@/store/store";
import { redirect } from "next/navigation";

export default function WishlistPage() {
  const { wishlist, isLoading, wishlistError, refetchWishlist } = useWishlist();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#f2efe8] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green border-t-transparent animate-spin" />
            <p className="text-xs text-verdant-muted">
              Loading your Wishlist...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (wishlistError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="Check your connection and try again."
          onRetry={() => {
            refetchWishlist();
          }}
        />
        <Footer />
      </>
    );
  }
  return <Wishlist items={wishlist} standalone />;
}
