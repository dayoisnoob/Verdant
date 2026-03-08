"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { WishlistApi } from "@/types";
import Link from "next/link";
import WishlistCard from "./WishlistCard";

const Wishlist = ({
  items,
  standalone = false,
}: {
  items: WishlistApi[];
  standalone?: boolean;
}) => {
  const grid = (
    <div>
      {!standalone && (
        <h2 className="font-playfair font-bold text-verdant-dark text-2xl mb-6">
          Saved Items
        </h2>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">♡</div>
          <h3 className="font-playfair font-bold text-verdant-dark text-2xl mb-2">
            Nothing saved yet
          </h3>
          <p className="text-verdant-muted text-sm mb-6 max-w-xs">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="bg-green text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
          >
            Browse Produce →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((p) => (
            <WishlistCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );

  // Embedded in profile tab — just return the grid
  if (!standalone) return grid;

  // Standalone page — wrap with full page chrome
  return (
    <>
      <Navbar />
      <main className="pt-24 bg-cream min-h-screen">
        <div className="px-20 py-10 border-b border-green/10">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Your Collection
          </p>
          <h1 className="font-playfair font-black text-verdant-dark text-5xl">
            Saved Items
          </h1>
          <p className="text-verdant-muted mt-2 text-sm">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="px-20 py-10">{grid}</div>
      </main>
      <Footer />
    </>
  );
};

export default Wishlist;
