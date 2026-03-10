"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { WishlistApi } from "@/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import WishlistCard from "./WishlistCard";

const Wishlist = ({
  items,
  standalone = false,
}: {
  items: WishlistApi[];
  standalone?: boolean;
}) => {
  const emptyState = (large = false) => (
    <div
      className={`bg-[#faf8f4] rounded-2xl border border-[#e8e4dc] flex flex-col items-center text-center gap-4 ${large ? "px-8 py-20" : "px-8 py-16"}`}
    >
      <div
        className={`bg-green-pale rounded-2xl flex items-center justify-center ${large ? "w-20 h-20" : "w-16 h-16"}`}
      >
        <Heart
          size={large ? 36 : 28}
          className="text-green"
          strokeWidth={1.3}
        />
      </div>
      <div>
        <p
          className={`font-playfair font-bold text-verdant-dark ${large ? "text-2xl" : "text-lg"}`}
        >
          Nothing saved yet
        </p>
        <p className="text-sm text-verdant-muted mt-1 max-w-[220px] mx-auto leading-relaxed">
          Tap the heart on any product to save it here for later
        </p>
      </div>
      <Link
        href="/shop"
        className={`font-semibold bg-green text-white rounded-full hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.25)] ${large ? "text-sm px-8 py-3.5" : "text-xs px-5 py-2.5"}`}
      >
        Browse produce
      </Link>
    </div>
  );

  const grid = (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((p) => (
        <WishlistCard key={p.id} p={p} />
      ))}
    </div>
  );

  if (!standalone) {
    return (
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-playfair font-bold text-verdant-dark text-2xl">
              Saved Items
            </h2>
            {items.length > 0 && (
              <p className="text-xs text-verdant-muted mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""} saved
              </p>
            )}
          </div>
          {items.length > 0 && (
            <Link
              href="/shop"
              className="text-xs text-green font-medium hover:underline"
            >
              Browse more →
            </Link>
          )}
        </div>
        {items.length === 0 ? emptyState(false) : grid}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f2efe8] pt-16">
        {/* Header */}
        <div className="border-b border-[#e4e0d8]">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-10 py-10">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-green mb-2">
              Your Collection
            </p>
            <div className="flex items-end justify-between gap-4">
              <h1 className="font-playfair font-black text-verdant-dark text-4xl md:text-5xl leading-tight">
                Saved Items
              </h1>
              {items.length > 0 && (
                <p className="text-sm text-verdant-muted mb-1 flex-shrink-0">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-10 py-10">
          {items.length === 0 ? emptyState(true) : grid}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Wishlist;
