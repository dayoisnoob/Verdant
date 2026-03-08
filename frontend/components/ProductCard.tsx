"use client";

import { useCart, useWishlistToggle } from "@/hooks";
import { Product } from "@/types";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
}

function StarRating({ rating }: { rating: string }) {
  const r = parseFloat(rating);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className="w-3 h-3"
          fill={star <= Math.round(r) ? "#F59E0B" : "#D1D5DB"}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function discountPct(price: string, original: string) {
  return Math.round((1 - parseFloat(price) / parseFloat(original)) * 100);
}

export default function ProductCard({
  product: p,
  isWishlisted,
}: ProductCardProps) {
  const { addItem, itemCount } = useCart();

  const handleAddToCart = async () => {
    if (!p) return;
    addItem(p);
    console.log(itemCount());
    toast.success("added to cart");
  };

  const { wishlisted, toggle } = useWishlistToggle(p.id, isWishlisted);

  return (
    <div className="bg-white rounded-2xl overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(45,106,79,0.14)] transition-all duration-300 cursor-pointer">
      <Link
        href={`/product/${p.slug}`}
        className="block relative h-48 overflow-hidden"
      >
        <Image
          src={p.images[0].url}
          alt={p.images[0].alt}
          fill
          className="object-cover transition-transform duration-400 group-hover:scale-[1.07]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {p.isOrganic && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
              Organic
            </span>
          )}
          {p.isOnSale && p.originalPrice && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-earth text-white px-2.5 py-1 rounded-full">
              {discountPct(p.price, p.originalPrice)}% off
            </span>
          )}
          {p.isSeasonal && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
              Seasonal
            </span>
          )}
        </div>

        {/* ── Wishlist heart ── */}
        <button
          onClick={toggle}
          className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm transition-all duration-200 ${
            wishlisted
              ? " text-orange-400"
              : "bg-white/90 text-[#ccc] hover:text-orange hover:bg-white"
          } disabled:opacity-50`}
        >
          <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Out of stock overlay */}
        {!p.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-red-700 bg-white px-4 py-2 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-5">
        <div className="text-[0.68rem] text-[#aaa] uppercase tracking-wider mb-1">
          {p.farm}
        </div>
        <Link href={`/product/${p.slug}`}>
          <div className="font-playfair font-bold text-verdant-dark text-lg leading-tight hover:text-green transition-colors">
            {p.name}
          </div>
        </Link>
        <div className="text-[0.7rem] text-[#bbb] mt-1">📍 {p.origin}</div>

        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={p.rating} />
          <span className="text-[0.7rem] text-[#999]">
            {p.rating} ({p.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {p.nutritionHighlights.slice(0, 2).map((n) => (
            <span
              key={n}
              className="text-[0.6rem] bg-green-pale text-green px-2 py-0.5 rounded-full"
            >
              {n}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#f0f0f0]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-green">
                £{p.price}
              </span>
              {p.originalPrice && (
                <span className="text-sm text-[#bbb] line-through">
                  £{p.originalPrice}
                </span>
              )}
            </div>
            <div className="text-[0.7rem] text-[#bbb]">{p.unit}</div>
          </div>

          <button
            disabled={!p.inStock}
            onClick={handleAddToCart}
            className="w-9 h-9 rounded-full bg-green flex items-center justify-center text-white text-xl font-light hover:bg-green-light hover:scale-110 transition-all duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
