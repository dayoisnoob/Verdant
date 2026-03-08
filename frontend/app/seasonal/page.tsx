"use client";

import { useState, useCallback } from "react";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

const SEASONS = [
  { label: "Spring", tags: ["spring"], emoji: "🌸", color: "bg-pink-50 border-pink-200 text-pink-700" },
  { label: "Summer", tags: ["summer", "bbq"], emoji: "☀️", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { label: "Autumn", tags: ["autumn"], emoji: "🍂", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { label: "Winter", tags: ["winter"], emoji: "❄️", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "Year Round", tags: ["year-round", "everyday"], emoji: "🌿", color: "bg-green-50 border-green-200 text-green-700" },
];

export default function SeasonalPage() {
  const [activeSeason, setActiveSeason] = useState("Summer");
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    setToast({ visible: true, message: `🛒 Added "${product.name}" to basket` });
  }, []);

  const hideToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), []);

  const season = SEASONS.find((s) => s.label === activeSeason)!;
  const seasonalProducts = PRODUCTS.filter((p) =>
    p.isSeasonal && p.tags.some((t) => season.tags.includes(t))
  );

  const allSeasonal = PRODUCTS.filter((p) => p.isSeasonal);

  return (
    <>
      <Navbar cartCount={cartCount} />
      <main className="pt-24 bg-cream min-h-screen">
        {/* Header */}
        <div className="px-20 py-16 bg-green-pale">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-3">Seasonal Guide</p>
          <h1 className="font-playfair font-black text-verdant-dark text-5xl mb-4">
            What&apos;s in Season
          </h1>
          <p className="text-verdant-muted max-w-xl text-base leading-relaxed">
            Seasonal produce tastes better, costs less, and supports the environment.
            Here&apos;s what our farmers are growing right now.
          </p>
        </div>

        {/* Season Tabs */}
        <div className="px-20 py-8 flex gap-4 border-b border-green/10">
          {SEASONS.map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveSeason(s.label)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-medium transition-all duration-200 ${
                activeSeason === s.label
                  ? "bg-green text-white border-green"
                  : "bg-white border-[#ddd] text-verdant-text hover:border-green hover:text-green"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="px-20 py-14">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
              {season.emoji} {activeSeason} Picks
            </h2>
            <span className="text-verdant-muted text-sm">
              {seasonalProducts.length} products available
            </span>
          </div>

          {seasonalProducts.length > 0 ? (
            <div className="grid grid-cols-4 gap-6">
              {seasonalProducts.map((p) => (
                <ProductCard key={p.slug} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">{season.emoji}</div>
              <p className="font-playfair text-xl text-verdant-dark">Nothing tagged for {activeSeason} yet</p>
              <p className="text-verdant-muted mt-2 text-sm">Check back soon or browse all seasonal produce below</p>
            </div>
          )}

          {/* All seasonal banner */}
          <div className="mt-20 bg-green rounded-3xl p-12 text-center relative overflow-hidden">
            <span className="absolute top-4 left-8 text-7xl opacity-10">🌱</span>
            <span className="absolute bottom-4 right-8 text-7xl opacity-10">🌾</span>
            <h3 className="font-playfair font-black text-white text-3xl mb-3">
              All {allSeasonal.length} Seasonal Products
            </h3>
            <p className="text-white/75 mb-6">Discover everything that&apos;s currently in season across all our farms.</p>
            <a
              href="/shop?filter=seasonal"
              className="inline-flex items-center gap-2 bg-white text-green px-8 py-3.5 rounded-full font-medium hover:bg-green-pale transition-colors"
            >
              Browse All Seasonal →
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </>
  );
}
