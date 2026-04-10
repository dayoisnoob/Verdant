"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useAllProducts } from "@/hooks";
import { getAllProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CloudSnow,
  Flower2,
  Leaf,
  Search,
  Sprout,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SEASONS = [
  { label: "Spring", tags: ["spring"], icon: Flower2 },
  { label: "Summer", tags: ["summer", "bbq"], icon: Sun },
  { label: "Autumn", tags: ["autumn"], icon: Leaf },
  { label: "Winter", tags: ["winter"], icon: CloudSnow },
  { label: "Year Round", tags: ["year-round", "everyday"], icon: Sprout },
];

export default function SeasonalPage() {
  const [activeSeason, setActiveSeason] = useState("Summer");

  const season = SEASONS.find((s) => s.label === activeSeason)!;

  const { data: PRODUCTS } = useAllProducts();

  if (!PRODUCTS) return null;

  console.log(PRODUCTS);

  const seasonalProducts = PRODUCTS.filter(
    (p) => p.isSeasonal && p.tags.some((t) => season.tags.includes(t)),
  );

  const allSeasonal = PRODUCTS.filter((p) => p.isSeasonal);

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 mb-8">
            <div className="py-8 md:py-12 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays
                  size={16}
                  className="text-green"
                  strokeWidth={2.5}
                />
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green">
                  Seasonal Guide
                </p>
              </div>
              <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4">
                What&apos;s in Season
              </h1>
              <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                Seasonal produce tastes better, costs less, and supports the
                environment. Here&apos;s what our farmers are harvesting right
                now.
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 mb-10">
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
              {SEASONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setActiveSeason(s.label)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest border-2 whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                    activeSeason === s.label
                      ? "bg-green border-green text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-verdant-dark"
                  }`}
                >
                  <s.icon size={16} strokeWidth={2.5} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-10 lg:px-16 xl:px-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-green shadow-sm">
                  <season.icon size={24} strokeWidth={2} />
                </div>
                <h2 className="font-playfair font-black text-verdant-dark text-3xl">
                  {activeSeason} Picks
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {seasonalProducts.length} Product
                {seasonalProducts.length !== 1 ? "s" : ""} Available
              </span>
            </div>

            {seasonalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {seasonalProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <Search
                    className="w-10 h-10 text-gray-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="font-playfair font-bold text-verdant-dark text-3xl mb-3">
                  Nothing for {activeSeason} yet
                </p>
                <p className="text-gray-500 font-medium text-sm max-w-sm">
                  Check back soon as our farmers update their harvests, or
                  browse all seasonal produce below.
                </p>
              </div>
            )}

            <div className="mt-20 bg-verdant-dark rounded-3xl p-10 md:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm border border-gray-800">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-green-light mb-6 backdrop-blur-md border border-white/20">
                  <Sprout size={32} strokeWidth={2} />
                </div>
                <h3 className="font-playfair font-black text-white text-3xl md:text-5xl mb-4 tracking-tight">
                  All {allSeasonal.length} Seasonal Products
                </h3>
                <p className="text-gray-400 font-medium text-sm md:text-base max-w-lg mb-10 leading-relaxed">
                  Discover everything that&apos;s currently in season across all
                  our partner farms, picked at peak freshness.
                </p>
                <Link
                  href="/shop?filter=seasonal"
                  className="bg-green text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-colors shadow-sm flex items-center gap-2"
                >
                  Shop All Seasonal <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
