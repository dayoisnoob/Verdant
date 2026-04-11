"use client";

import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Pagination } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { getCategories, getPaginatedProducts } from "@/lib/api";
import { FILTERS, PAGE_LIMIT } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
  Sprout,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="w-full aspect-[4/3] bg-gray-100" />
      <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-1">
        <div className="flex justify-between gap-2 sm:gap-4">
          <div className="h-3 w-1/3 bg-gray-200 rounded-md" />
          <div className="h-3 w-1/4 bg-gray-200 rounded-md" />
        </div>
        <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded-lg mt-1" />
        <div className="flex gap-1 sm:gap-1.5 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-3 w-3 sm:h-3.5 sm:w-3.5 bg-gray-200 rounded-sm"
            />
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex justify-between items-end pt-3 sm:pt-4 mt-2 border-t-2 border-gray-50">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="h-4 sm:h-5 w-12 sm:w-16 bg-gray-200 rounded-lg" />
            <div className="h-2.5 sm:h-3 w-8 sm:w-10 bg-gray-100 rounded-md" />
          </div>
          <div className="h-8 w-20 sm:h-9 sm:w-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    // 🚨 Changed to grid-cols-2 on mobile and tightened the gap
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";
  const initialFilter = searchParams.get("filter") ?? "all";
  const q = searchParams.get("q") ?? "";

  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "products",
      activeCategory,
      activeFilter,
      sortBy,
      currentPage,
      q,
    ],
    queryFn: async () =>
      await getPaginatedProducts(
        activeCategory,
        sortBy,
        activeFilter,
        currentPage,
        PAGE_LIMIT,
        q,
      ),
    placeholderData: (prev) => prev,
  });

  const pagination = data?.pagination;
  const PRODUCTS = data?.products ?? [];
  const productCount = pagination?.totalItems ?? PRODUCTS.length;

  const { data: CATEGORIES = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = activeFilter !== "all" || activeCategory !== "All";

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveCategory("All");
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "Check your connection and try again."
            }
            onRetry={refetch}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* 🚨 Adjusted padding to px-4 on mobile for better 2-column spacing */}
        <div className="px-4 sm:px-10 lg:px-16 xl:px-20 max-w-[1600px] mx-auto">
          <div className="py-8 md:py-12 border-b border-gray-200">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-4">
              Our Produce
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl lg:text-6xl tracking-tight">
                Shop All
              </h1>
              <p className="text-gray-500 font-medium text-sm">
                {isLoading
                  ? "Loading inventory..."
                  : `Showing ${productCount} product${productCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="py-6 flex flex-col gap-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="sm:hidden flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-verdant-dark hover:border-green transition-colors w-full"
              >
                <SlidersHorizontal size={16} />
                Filters & Sorting
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-green ml-1" />
                )}
              </button>

              <div className="hidden sm:flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
                  Filter by:
                </span>
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => handleFilterChange(f.value)}
                    className={`text-xs font-normal px-5 py-2.5 rounded-xl border-2 transition-colors duration-200 ${
                      activeFilter === f.value
                        ? "bg-green text-white border-green"
                        : "bg-white text-verdant-dark border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors ml-2 uppercase tracking-wider"
                  >
                    <X size={14} strokeWidth={2.5} />
                    Clear
                  </button>
                )}
              </div>

              <div className="hidden sm:block relative min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full appearance-none text-sm font-normal px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-verdant-dark outline-none focus:border-green hover:border-gray-300 transition-colors cursor-pointer pr-10"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {filtersOpen && (
              <div className="sm:hidden bg-gray-50 rounded-2xl p-5 flex flex-col gap-6 border border-gray-100">
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Sort By
                  </p>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full appearance-none text-sm font-bold px-4 py-3 rounded-xl border border-gray-200 bg-white text-verdant-dark outline-none focus:border-green transition-colors cursor-pointer pr-10"
                    >
                      <option value="default">Sort: Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Filter Type
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        className={`text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-colors ${
                          activeFilter === f.value
                            ? "bg-green text-white border-green"
                            : "bg-white text-verdant-dark border-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 🚨 Adjusted margin/padding to match new px-4 layout */}
            <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs font-normal px-5 py-2.5 rounded-xl border-2 whitespace-nowrap transition-colors duration-200 ${
                    activeCategory === cat
                      ? "bg-green/10 text-green border-green/20"
                      : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-300 hover:text-verdant-dark"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 sm:pt-10">
            {isLoading ? (
              <ProductGridSkeleton />
            ) : PRODUCTS.length > 0 ? (
              // 🚨 Changed to grid-cols-2 on mobile and tightened the gap
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {PRODUCTS.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6 mt-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <Sprout className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-playfair font-bold text-2xl text-verdant-dark mb-3">
                  No products found
                </p>
                <p className="text-gray-500 font-medium text-sm max-w-sm mb-6">
                  We couldn&apos;t find any produce matching your current
                  filters. Try adjusting your selection.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-bold text-white bg-verdant-dark px-6 py-3 rounded-xl hover:bg-black transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {pagination && !isLoading && PRODUCTS.length > 0 && (
            <div className="mt-12 sm:mt-16 pb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <Container>
        <ShopContent />
      </Container>
    </Suspense>
  );
}
