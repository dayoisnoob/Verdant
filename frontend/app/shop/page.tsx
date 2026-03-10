"use client";

import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Pagination } from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/api";
import { FILTERS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-[#f0f0f0]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-2.5 w-1/3 bg-[#e8e8e8] rounded-full" />
          <div className="h-2.5 w-1/4 bg-[#e8e8e8] rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-[#e8e8e8] rounded-md" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="h-3 w-3 bg-[#e8e8e8] rounded-sm" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#f5f5f5] mt-1">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-14 bg-[#e8e8e8] rounded-md" />
            <div className="h-2.5 w-10 bg-[#e8e8e8] rounded-sm" />
          </div>
          <div className="h-8 w-20 bg-[#e8e8e8] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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

  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", activeCategory, activeFilter, sortBy, currentPage],
    queryFn: async () =>
      await getProducts(activeCategory, sortBy, activeFilter, currentPage),
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

  return (
    <>
      <Navbar />

      <main className="pt-20 pb-20 min-h-screen bg-cream">
        <div className="px-4 sm:px-8 lg:px-16 xl:px-20">
          {/* ── Header ── */}
          <div className="py-10 sm:py-12 border-b border-green/10">
            <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-2">
              Our Produce
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl">
                Shop All
              </h1>
              <p className="text-verdant-muted text-sm">
                {isLoading
                  ? "Loading…"
                  : `${productCount} product${productCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* ── Controls row ── */}
          <div className="py-5 flex items-center gap-3 flex-wrap border-b border-green/10">
            {/* Mobile: filter toggle button */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="sm:hidden flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-[#ddd] bg-white text-verdant-text hover:border-green hover:text-green transition-all"
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
              )}
            </button>

            {/* Desktop: filter pills */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                    activeFilter === f.value
                      ? "bg-green text-white border-green"
                      : "bg-white text-verdant-text border-[#ddd] hover:border-green hover:text-green"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="hidden sm:flex items-center gap-1.5 text-xs text-verdant-muted hover:text-green transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}

            {/* Sort — right aligned */}
            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm px-4 py-2 rounded-full border border-[#ddd] bg-white text-verdant-text outline-none hover:border-green focus:border-green transition-colors cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile: expandable filter drawer */}
          {filtersOpen && (
            <div className="sm:hidden bg-white border-b border-green/10 px-4 py-5 flex flex-col gap-5">
              {/* Filter pills */}
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-verdant-muted mb-3">
                  Filter
                </p>
                <div className="flex gap-2 flex-wrap">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => handleFilterChange(f.value)}
                      className={`text-xs px-4 py-2 rounded-full border transition-all ${
                        activeFilter === f.value
                          ? "bg-green text-white border-green"
                          : "bg-white text-verdant-text border-[#ddd]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category pills */}
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-verdant-muted mb-3">
                  Category
                </p>
                <div className="flex gap-2 flex-wrap">
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                        activeCategory === cat
                          ? "bg-green-pale text-green border-green-light font-medium"
                          : "bg-transparent text-[#888] border-[#e5e5e5]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                  className="self-start flex items-center gap-1.5 text-xs text-verdant-muted"
                >
                  <X size={12} />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Desktop: categories row */}
          <div className="hidden sm:flex gap-2 flex-wrap py-5 border-b border-green/10">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-green-pale text-green border-green-light font-medium"
                    : "bg-transparent text-[#888] border-[#e5e5e5] hover:border-green-light hover:text-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          <div className="pt-8">
            {isLoading ? (
              <ProductGridSkeleton />
            ) : isError ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="font-playfair text-xl text-verdant-dark mb-2">
                  Failed to load products
                </p>
                <p className="text-sm text-verdant-muted">
                  Check your connection and try again
                </p>
              </div>
            ) : PRODUCTS.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-45gap-4 sm:gap-4">
                {PRODUCTS.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🌿</div>
                <p className="font-playfair text-xl text-verdant-dark mb-2">
                  No products found
                </p>
                <p className="text-sm text-verdant-muted">
                  Try adjusting your filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-5 text-sm text-green font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {pagination && !isLoading && PRODUCTS.length > 0 && (
            <div className="mt-12">
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
    </>
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
