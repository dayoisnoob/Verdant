"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getAllProducts } from "@/lib/api/product.api";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  "Tomatoes",
  "Leafy Greens",
  "Organic",
  "Seasonal",
  "Root Vegetables",
  "Fresh Herbs",
  "Berries",
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products } = useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => setQuery(""), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!products) return null;

  const results = query.trim()
    ? products?.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Product Search
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="px-6 pb-4">
            <div className="flex items-center border border-stone-200 rounded-md overflow-hidden focus-within:border-stone-900 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your product here..."
                className="flex-1 px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-stone-900 text-white hover:bg-rose-600 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="border-t border-stone-100 max-h-80 overflow-y-auto">
            {query.trim() === "" ? (
              <div>
                <p className="flex items-center gap-2 px-6 py-3 text-sm text-stone-500 bg-stone-50">
                  Search and explore your products from{" "}
                  <span className="font-bold text-stone-900">Verdant</span>
                </p>
                <ul>
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-3 px-6 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors text-left"
                      >
                        <Search size={14} className="text-stone-400 shrink-0" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : results.length > 0 ? (
              <ul>
                {results?.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <Image
                        height={500}
                        width={500}
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        className="w-10 h-12 object-cover rounded shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {product.originalPrice && (
                          <p className="text-xs text-stone-400 line-through">
                            ${Number(product.originalPrice).toFixed(2)}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-stone-900">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-stone-400 text-sm">
                  No products found for &quot;{query}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
