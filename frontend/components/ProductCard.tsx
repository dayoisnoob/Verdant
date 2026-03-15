"use client";

import { useCart, useWishlistToggle } from "@/hooks";
import { ProductCard as ProductCardType } from "@/types";
import { Heart, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { StarRating } from "./StarRating";

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
      className="group flex flex-col bg-white rounded-xl border border-[#ebebeb] hover:border-green/25 hover:shadow-[0_4px_24px_rgba(45,106,79,0.1)] transition-all duration-300 overflow-hidden"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f7f7f7]">
        <Image
          src={p.images[0].url}
          alt={p.images[0].alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {!p.inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-verdant-muted bg-white border border-[#e0e0e0] px-4 py-2 rounded-full shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {p.isOnSale && p.originalPrice && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-orange text-white px-2.5 py-1 rounded-full shadow-sm">
              {discountPct(p.price, p.originalPrice)}% off
            </span>
          )}
          {p.isOrganic && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full shadow-sm">
              Organic
            </span>
          )}
          {p.isSeasonal && !p.isOrganic && (
            <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-white text-verdant-muted border border-[#e0e0e0] px-2.5 py-1 rounded-full shadow-sm">
              Seasonal
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            wishlisted
              ? "text-orange  bg-orange/70"
              : " text-[#c0c0c0] bg-white/50 hover:text-orange hover:bg-white"
          }`}
        >
          <Heart
            size={20}
            fill={wishlisted ? "currentColor" : "none"}
            strokeWidth={2}
            color="orange"
          />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.62rem] text-verdant-muted uppercase tracking-wider truncate">
            {p.farm}
          </span>
          <span className="text-[0.62rem] text-[#c0c0c0] shrink-0">
            {p.origin}
          </span>
        </div>

        <h3 className="font-playfair font-bold text-verdant-dark text-[0.95rem] leading-snug group-hover:text-green transition-colors line-clamp-2">
          {p.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-0.5">
          <StarRating rating={p.rating} />
          <span className="text-[0.65rem] text-verdant-muted">
            {p.rating}{" "}
            <span className="text-[#d0d0d0]">
              ({p.reviewCount.toLocaleString()})
            </span>
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#f2f2f2]">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-verdant-dark text-base">
                £{Number(p.price).toFixed(2)}
              </span>
              {p.originalPrice && (
                <span className="text-xs text-[#c0c0c0] line-through">
                  £{p.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[0.62rem] text-verdant-muted">{p.unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!p.inStock}
            aria-label="Add to basket"
            className="flex items-center gap-1.5 bg-green text-white text-[0.72rem] font-semibold px-3.5 py-2 rounded-full hover:bg-green-mid transition-all duration-200 hover:shadow-[0_4px_12px_rgba(45,106,79,0.25)] disabled:bg-[#e5e5e5] disabled:text-[#b0b0b0] disabled:cursor-not-allowed disabled:shadow-none"
          >
            <ShoppingBasket size={13} strokeWidth={2.5} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
