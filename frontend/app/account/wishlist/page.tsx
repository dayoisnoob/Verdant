"use client";

import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";

export default function WishlistPage() {
  const { wishlist, isLoading, wishlistError, refetchWishlist } = useWishlist();

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
  return <Wishlist items={wishlist} standalone isLoading={isLoading} />;
}
