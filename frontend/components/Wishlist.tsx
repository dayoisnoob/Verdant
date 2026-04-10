"use client";

import BlurImage from "@/components/BlurImage";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useCart, useWishlistToggle } from "@/hooks";
import { WishlistApi } from "@/types";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const WishlistCardSkeleton = () => (
  <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
    <div className="aspect-[4/3] w-full bg-gray-200 animate-pulse" />
    <div className="flex flex-col flex-1 p-5 gap-3">
      <div className="w-16 h-3 bg-gray-200 rounded-md animate-pulse" />
      <div className="w-3/4 h-5 bg-gray-200 rounded-md animate-pulse" />
      <div className="flex-1" />
      <div className="flex items-end justify-between pt-4 mt-2 border-t border-gray-100">
        <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const WishlistCard = ({ p }: { p: WishlistApi }) => {
  const { wishlisted, toggle } = useWishlistToggle(p.id);
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!p) return;
    setIsAdding(true);
    try {
      await addItem(p);
      toast.success(`${p.name} added to basket`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green/30 hover:shadow-md transition-all duration-200 overflow-hidden relative h-full">
      <Link
        href={`/product/${p.slug}`}
        className="relative aspect-[4/3] w-full bg-gray-50 border-b border-gray-100 overflow-hidden block flex-shrink-0"
      >
        <BlurImage
          src={p.images[0]?.url}
          alt={p.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {p.isOrganic && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-green text-white px-2.5 py-1.5 rounded-md shadow-sm z-10">
            Organic
          </span>
        )}

        {!p.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <button
        onClick={toggle}
        aria-label="Toggle wishlist"
        className={`absolute top-3 right-3 w-9 h-9 rounded-full border flex items-center justify-center transition-colors shadow-sm z-20 disabled:opacity-50 ${
          wishlisted
            ? "bg-white border-gray-100"
            : "bg-white border-gray-100 hover:bg-gray-50"
        }`}
      >
        <Heart
          size={18}
          fill={wishlisted ? "#f97316" : "none"}
          className={wishlisted ? "text-orange-500" : "text-gray-400"}
          strokeWidth={2.5}
        />
      </button>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
          {p.farm}
        </div>
        <Link href={`/product/${p.slug}`} className="block">
          <h3 className="font-playfair font-bold text-verdant-dark text-lg leading-snug group-hover:text-green transition-colors line-clamp-2">
            {p.name}
          </h3>
        </Link>

        <div className="flex-1" />

        <div className="flex items-end justify-between pt-4 mt-2 border-t border-gray-100">
          <span className="font-black text-verdant-dark text-xl leading-none">
            £{(p.price / 100).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!p.inStock || isAdding}
            className="w-10 h-10 bg-green text-white rounded-xl flex items-center justify-center hover:bg-green-mid transition-all shadow-sm flex-shrink-0 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            aria-label="Add to basket"
          >
            {isAdding ? (
              <Loader2
                size={18}
                strokeWidth={2.5}
                className="animate-spin text-gray-400"
              />
            ) : (
              <ShoppingBag size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = ({
  items,
  standalone = false,
  isLoading = false,
}: {
  items: WishlistApi[];
  standalone?: boolean;
  isLoading?: boolean;
}) => {
  const emptyState = (large = false) => (
    <div
      className={`bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center ${
        large ? "py-24 px-6" : "py-16 px-6"
      }`}
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
        <Heart className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
      </div>
      <h2 className="font-playfair font-bold text-verdant-dark text-3xl mb-3">
        Nothing saved yet
      </h2>
      <p className="text-gray-500 font-medium text-sm max-w-sm mb-8 leading-relaxed">
        Tap the heart on any product to save it here for later. Build your
        collection of farm-fresh favorites.
      </p>
      <Link
        href="/shop"
        className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-colors flex items-center gap-2 shadow-sm"
      >
        Browse Produce <ArrowRight size={18} />
      </Link>
    </div>
  );

  const grid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((p) => (
        <WishlistCard key={p.id} p={p} />
      ))}
    </div>
  );

  const skeletonGrid = (count: number) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <WishlistCardSkeleton key={i} />
      ))}
    </div>
  );

  // Embedded within the Profile Page
  if (!standalone) {
    return (
      <div className="flex flex-col w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mb-6">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-verdant-dark text-base">
              Saved Items
            </h3>
            {!isLoading && items.length > 0 && (
              <Link
                href="/shop"
                className="text-xs font-bold text-green uppercase tracking-widest hover:text-green-mid flex items-center gap-1"
              >
                Browse More <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 bg-gray-50/30">{skeletonGrid(3)}</div>
          ) : items.length === 0 ? (
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-verdant-dark text-lg mb-2">
                Nothing saved yet
              </p>
              <p className="text-sm font-medium text-gray-500 mb-6">
                Tap the heart on any product to save it here.
              </p>
              <Link
                href="/shop"
                className="text-xs font-bold uppercase tracking-widest bg-green text-white px-6 py-3 rounded-xl hover:bg-green-mid transition-colors shadow-sm"
              >
                Start Browsing
              </Link>
            </div>
          ) : (
            <div className="p-6 bg-gray-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p) => (
                  <WishlistCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standalone Page (e.g., /wishlist)
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="py-8 md:py-12 border-b border-gray-200 mb-10">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-4">
              Your Collection
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl tracking-tight">
                Saved Items
              </h1>
              {isLoading ? (
                <div className="w-24 h-5 bg-gray-200 rounded-md animate-pulse" />
              ) : items.length > 0 ? (
                <p className="text-gray-500 font-medium text-sm">
                  {items.length} item{items.length !== 1 ? "s" : ""} saved
                </p>
              ) : null}
            </div>
          </div>

          {isLoading
            ? skeletonGrid(8)
            : items.length === 0
              ? emptyState(true)
              : grid}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
