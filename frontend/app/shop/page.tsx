"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks";
import { getProducts } from "@/lib/api";
import { PaginationProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Organic", value: "organic" },
  { label: "Seasonal", value: "seasonal" },
  { label: "On Sale", value: "on-sale" },
  { label: "In Stock", value: "in-stock" },
];

function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblings = 1,
): (number | null)[] {
  const rangeStart = Math.max(2, currentPage - siblings);
  const rangeEnd = Math.min(totalPages - 1, currentPage + siblings);

  const middle: number[] = [];
  for (let i = rangeStart; i <= rangeEnd; i++) middle.push(i);

  const showLeftDots = rangeStart > 2;
  const showRightDots = rangeEnd < totalPages - 1;

  const pages: (number | null)[] = [1];

  if (showLeftDots) pages.push(null);
  else if (rangeStart === 2) {
    /* no gap needed, 2 would be in middle already */
  }

  pages.push(...middle);

  if (showRightDots) pages.push(null);

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center gap-4 mt-14">
      {/* Range label */}
      <p className="text-xs text-verdant-muted">
        Showing{" "}
        <span className="font-medium text-verdant-dark">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-verdant-dark">{totalItems}</span>{" "}
        products
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            enabled:border-[#e5e5e5] enabled:text-verdant-muted
            enabled:hover:border-green enabled:hover:text-green enabled:hover:bg-green-pale/40"
        >
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M10 12L6 8l4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Prev
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, idx) =>
            page === null ? (
              <span
                key={`dots-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-sm text-[#bbb] select-none"
              >
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-200 ${
                  page === currentPage
                    ? "bg-green text-white shadow-[0_4px_12px_rgba(45,106,79,0.3)] scale-105"
                    : "text-verdant-text hover:bg-green-pale hover:text-green border border-transparent hover:border-green-light"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            enabled:border-[#e5e5e5] enabled:text-verdant-muted
            enabled:hover:border-green enabled:hover:text-green enabled:hover:bg-green-pale/40"
        >
          Next
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M6 4l4 4-4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-green/10 animate-pulse"
        >
          <div className="h-52 bg-green-pale/60" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-3 w-1/3 bg-[#e5e5e5] rounded-full" />
            <div className="h-4 w-3/4 bg-[#e5e5e5] rounded-full" />
            <div className="h-3 w-1/2 bg-[#e5e5e5] rounded-full" />
            <div className="flex justify-between mt-1">
              <div className="h-5 w-16 bg-[#e5e5e5] rounded-full" />
              <div className="h-8 w-8 rounded-full bg-green-pale/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";
  const initialFilter = searchParams.get("filter") ?? "all";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const { wishlist } = useWishlist();

  const isWishlisted = (id: string) => {
    return wishlist.some((p) => p.id === id);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", activeCategory, sortBy, currentPage],
    queryFn: async () => await getProducts(activeCategory, sortBy, currentPage),
    placeholderData: (prev) => prev,
  });

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PRODUCTS = data?.data ?? [];
  const pagination = data?.pagination;
  const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))].sort();

  const filtered = PRODUCTS.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const filterMatch =
      activeFilter === "all" ||
      (activeFilter === "organic" && p.isOrganic) ||
      (activeFilter === "seasonal" && p.isSeasonal) ||
      (activeFilter === "on-sale" && p.isOnSale) ||
      (activeFilter === "in-stock" && p.inStock);
    return catMatch && filterMatch;
  });

  const productCount = pagination?.totalItems ?? filtered.length;

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-20 min-h-screen bg-cream">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Our Produce
          </p>
          <h1 className="font-playfair font-black text-verdant-dark text-5xl">
            Shop All
          </h1>
          <p className="text-verdant-muted mt-3 text-base">
            {isLoading
              ? "Loading products…"
              : `${productCount} product${productCount !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`text-sm px-5 py-2 rounded-full border transition-all duration-200 ${
                activeFilter === f.value
                  ? "bg-green text-white border-green"
                  : "bg-white text-verdant-text border-[#ddd] hover:border-green hover:text-green"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Sort */}
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm px-4 py-2 rounded-full border border-[#ddd] bg-white text-verdant-text outline-none hover:border-green focus:border-green transition-colors cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 flex-wrap mb-10 pb-6 border-b border-green/10">
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

        {/* Product grid */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-playfair text-xl text-verdant-dark">
              Failed to load products
            </p>
            <p className="mt-2 text-sm text-verdant-muted">
              Check your connection and try again
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                isWishlisted={isWishlisted(p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-verdant-muted">
            <div className="text-5xl mb-4">🌿</div>
            <p className="font-playfair text-xl text-verdant-dark">
              No products found
            </p>
            <p className="mt-2 text-sm">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination — only shown when API returns pagination metadata */}
        {pagination && !isLoading && filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
