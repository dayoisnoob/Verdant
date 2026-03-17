"use client";

import { useCart, useWishlistToggle } from "@/hooks";
import { ProductCard as ProductCardType } from "@/types";
import { Clock, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { StarRating } from "./StarRating";
import { LOW_PRODUCT_THRESHOLD } from "@/lib/constants";

function discountPct(price: string, original: string) {
  return Math.round((1 - parseFloat(price) / parseFloat(original)) * 100);
}

export default function ProductCard({
  product: p,
}: {
  product: ProductCardType;
}) {
  const { addItem } = useCart();
  const { wishlisted, toggle } = useWishlistToggle(p.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!p.inStock) return;
    addItem(p);
    toast.success(`${p.name} added to basket`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(e);
  };

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-green/40 hover:shadow-sm transition-all duration-200 overflow-hidden"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100">
        <Image
          src={p.images[0].url}
          alt={p.images[0].alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {!p.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
          {p.isOnSale && p.originalPrice && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white px-2.5 py-1.5 rounded-md shadow-sm">
              {discountPct(p.price, p.originalPrice)}% off
            </span>
          )}
          {p.isOrganic && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1.5 rounded-md shadow-sm">
              Organic
            </span>
          )}
          {p.isSeasonal && !p.isOrganic && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-md shadow-sm">
              Seasonal
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center transition-colors shadow-sm z-20 hover:bg-gray-50"
        >
          <Heart
            size={18}
            fill={wishlisted ? "#f97316" : "none"}
            strokeWidth={2.5}
            className={wishlisted ? "text-orange-500" : "text-gray-400"}
          />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex flex-col gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest line-clamp-2 leading-relaxed">
            {p.farm}
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {p.origin}
          </span>
        </div>

        <h3 className="font-playfair font-bold text-verdant-dark text-lg leading-snug group-hover:text-green transition-colors line-clamp-2">
          {p.name}
        </h3>

        <div className="flex items-center gap-2">
          <StarRating rating={p.rating} />
          <span className="text-xs font-bold text-gray-600">
            {p.rating}{" "}
            <span className="text-gray-400">
              ({p.reviewCount.toLocaleString()})
            </span>
          </span>
        </div>

        {p.inStock && p.stock <= LOW_PRODUCT_THRESHOLD && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} className="text-orange-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
              Almost gone
            </span>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-end justify-between pt-4 mt-2 border-t border-gray-100">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-verdant-dark text-xl leading-none">
                £{Number(p.price).toFixed(2)}
              </span>
              {p.originalPrice && (
                <span className="text-xs font-bold text-gray-400 line-through">
                  £{p.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {p.unit}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!p.inStock}
            aria-label="Add to basket"
            className="flex items-center gap-2 bg-green text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-green-mid transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider"
          >
            <ShoppingBag size={16} strokeWidth={2.5} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
