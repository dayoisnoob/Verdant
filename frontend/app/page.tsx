"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/types";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import FreshnessBar from "@/components/FreshnessBar";
import FarmStory from "@/components/FarmStory";
import FarmsGrid from "@/components/FarmsGrid";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount((c) => c + 1);
    setToast({
      visible: true,
      message: `🛒 Added "${product.name}" to basket`,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  const {
    data: PRODUCTS,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts(undefined, undefined, 1, 999);
      return res.data;
    },
  });

  if (!PRODUCTS) return null;

  console.log(PRODUCTS);

  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured);
  const onSaleProducts = PRODUCTS.filter((p) => p.isOnSale && p.originalPrice);

  const categoryMap: Record<string, { count: number; organicCount: number }> =
    {};
  PRODUCTS.forEach((p) => {
    if (!categoryMap[p.category])
      categoryMap[p.category] = { count: 0, organicCount: 0 };
    categoryMap[p.category].count++;
    if (p.isOrganic) categoryMap[p.category].organicCount++;
  });
  const categories = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  const uniqueFarms = (() => {
    const map: Record<
      string,
      { origin: string; productCount: number; isOrganic: boolean }
    > = {};
    PRODUCTS.forEach((p) => {
      if (!map[p.farm])
        map[p.farm] = { origin: p.origin, productCount: 0, isOrganic: false };
      map[p.farm].productCount++;
      if (p.isOrganic) map[p.farm].isOrganic = true;
    });
    return Object.entries(map).map(([name, info]) => ({ name, ...info }));
  })();

  const uniqueFarmNames = [...new Set(PRODUCTS.map((p) => p.farm))];

  const sameDayCount = PRODUCTS.filter((p) => p.harvestDaysAgo === 0).length;
  const organicCount = PRODUCTS.filter((p) => p.isOrganic).length;
  const categoryCount = new Set(PRODUCTS.map((p) => p.category)).size;

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <Hero featuredProducts={featuredProducts} />

        {/* ── Marquee ── */}
        <MarqueeStrip farms={uniqueFarmNames} />

        {/* ── Categories ── */}
        <CategoryGrid categories={categories} />

        {/* ── Featured Products ── */}
        <section className="bg-[#F0F7F2] px-20 pb-22 pt-22">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
                Staff Picks
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-[1.15]">
                Featured This Week
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-green text-sm font-medium border-b border-green pb-px hover:opacity-65 transition-opacity whitespace-nowrap"
            >
              See all products →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* ── Freshness Bar ── */}
        <FreshnessBar
          sameDayCount={sameDayCount}
          organicCount={organicCount}
          categoryCount={categoryCount}
        />

        {/* ── On Sale ── */}
        <section className="px-20 py-22">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
                Limited Time
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-[1.15]">
                On Sale Now
              </h2>
            </div>
            <Link
              href="/shop?filter=on-sale"
              className="text-green text-sm font-medium border-b border-green pb-px hover:opacity-65 transition-opacity whitespace-nowrap"
            >
              View all offers →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {onSaleProducts.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* ── Farm Story ── */}
        <FarmStory />

        {/* ── Farms Grid ── */}
        <FarmsGrid farms={uniqueFarms} />

        {/* ── Newsletter ── */}
        <Newsletter />
      </main>

      <Footer />

      {/* ── Toast ── */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
}
