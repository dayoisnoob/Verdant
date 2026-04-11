"use client";

import BlurImage from "@/components/BlurImage";
import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RelatedProducts from "@/components/RelatedProducts";
import { StarRating } from "@/components/StarRating";
import { useCart, useWishlistToggle } from "@/hooks";
import { getProductBySlug } from "@/lib/api";
import { LOW_PRODUCT_THRESHOLD, MAX_CART_LIMIT } from "@/lib/constants";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Snowflake,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { addItem, updateQuantity, removeItem, items } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["single-product", slug],
    queryFn: async () => await getProductBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });

  const { toggle, wishlisted, isToggling } = useWishlistToggle(
    product?.id ?? "",
  );

  if (isLoading) {
    return (
      <Container>
        <div className="bg-cream min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-24 pb-20">
            <div className="max-w-[1600px] mx-auto">
              <div className="px-6 sm:px-10 lg:px-16 xl:px-20 mb-6 py-4">
                <div className="w-48 h-4 bg-gray-200 rounded-md animate-pulse" />
              </div>

              <div className="px-6 sm:px-10 lg:px-16 xl:px-20 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
                  <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 lg:sticky lg:top-28">
                    <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                    <div className="flex gap-4 overflow-hidden">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6 sm:gap-8 py-2">
                    <div>
                      <div className="flex gap-3 mb-4">
                        <div className="w-20 h-6 bg-gray-200 rounded-md animate-pulse" />
                        <div className="w-24 h-6 bg-gray-200 rounded-md animate-pulse" />
                      </div>
                      <div className="w-3/4 h-10 sm:h-16 bg-gray-200 rounded-xl animate-pulse mb-4" />
                      <div className="w-40 h-6 bg-gray-200 rounded-md animate-pulse" />
                    </div>

                    <div className="w-32 h-10 sm:h-12 bg-gray-200 rounded-xl animate-pulse" />

                    <div className="flex flex-col gap-3">
                      <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse" />
                      <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse" />
                      <div className="w-4/5 h-4 bg-gray-200 rounded-md animate-pulse" />
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="flex gap-4 h-12 sm:h-14">
                      <div className="flex-1 sm:max-w-40 bg-gray-200 rounded-xl animate-pulse" />
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse" />
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-24 sm:h-28 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse"
                        />
                      ))}
                    </div>

                    <div className="h-24 sm:h-28 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "Check your connection and try again."
            }
            onRetry={refetch}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) notFound();

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  const itemInCart = items.find((i) => i.productId === product.id);
  const qtyInCart = itemInCart?.quantity ?? 0;
  const isStockLimitReached = qtyInCart === product.stock;
  const isCartLimitReached = qtyInCart >= MAX_CART_LIMIT;

  const handleAddToCart = async (p: Product) => {
    setIsUpdating(true);
    try {
      await addItem(p);
      toast.success(`${p.name} added to basket`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async () => {
    setIsUpdating(true);
    try {
      await updateQuantity(product.id, 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    setIsUpdating(true);
    try {
      if (qtyInCart <= 1) {
        await removeItem(product.id);
        toast.info("Item removed from basket");
      } else {
        await updateQuantity(product.id, -1);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container>
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-[1600px] mx-auto">
            <div className="px-6 sm:px-10 lg:px-16 xl:px-20 mb-4 sm:mb-6">
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-4 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Link href="/" className="hover:text-green transition-colors">
                  Home
                </Link>
                <ChevronRight size={12} className="flex-shrink-0" />
                <Link
                  href="/shop"
                  className="hover:text-green transition-colors"
                >
                  Shop
                </Link>
                <ChevronRight size={12} className="flex-shrink-0" />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-green transition-colors"
                >
                  {product.category}
                </Link>
                <ChevronRight size={12} className="flex-shrink-0" />
                <span className="text-verdant-dark">{product.name}</span>
              </nav>
            </div>

            <div className="px-6 sm:px-10 lg:px-16 xl:px-20 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16 items-start">
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 lg:sticky lg:top-28">
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-50 border border-gray-100">
                    <BlurImage
                      key={product.images[activeImg]?.url}
                      src={product.images[activeImg]?.url}
                      alt={product.images[activeImg]?.alt || "Product image"}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-white text-gray-600 font-bold uppercase tracking-widest text-xs sm:text-sm px-6 py-3 rounded-xl border-2 border-gray-200 shadow-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                      {product.isOrganic && (
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-green text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm">
                          Organic
                        </span>
                      )}
                      {discountPct && (
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm">
                          {discountPct}% off
                        </span>
                      )}
                      {product.harvestDaysAgo === 0 && (
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white text-green border border-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm">
                          Harvested today
                        </span>
                      )}
                    </div>

                    {product.harvestDaysAgo !== undefined &&
                      product.harvestDaysAgo <= 3 && (
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/90 backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                          <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Harvested
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-verdant-dark">
                            {product.harvestDaysAgo === 0
                              ? "Today"
                              : `${product.harvestDaysAgo} days ago`}
                          </p>
                        </div>
                      )}
                  </div>

                  {product.images.length > 1 && (
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                            activeImg === i
                              ? "border-green shadow-sm ring-4 ring-green/10"
                              : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                          }`}
                        >
                          <BlurImage
                            src={img.url}
                            alt={img.alt || "Thumbnail"}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6 sm:gap-8 py-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-verdant-dark bg-gray-100 px-3 py-1.5 rounded-md">
                        {product.farm}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12} className="sm:w-[14px] sm:h-[14px]" />
                        {product.origin}
                      </span>
                    </div>

                    <h1 className="font-playfair font-black text-verdant-dark text-3xl sm:text-5xl lg:text-6xl leading-tight sm:leading-none mb-3 sm:mb-4 tracking-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <StarRating rating={product.rating} />
                      <span className="text-xs sm:text-sm font-bold text-verdant-dark">
                        {product.rating}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                        ({product.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3 sm:gap-4">
                    <span className="font-playfair font-black text-verdant-dark text-4xl sm:text-6xl leading-none">
                      £{(product.price / 100).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl sm:text-2xl font-bold text-gray-300 line-through mb-1">
                        £{(product.originalPrice / 100).toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2 ml-1 sm:ml-2">
                      {product.unit}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-gray-600 leading-relaxed max-w-2xl">
                    {product.description}
                  </p>

                  {product.nutritionHighlights?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.nutritionHighlights.map((n) => (
                        <span
                          key={n}
                          className="text-[10px] sm:text-[11px] font-bold bg-green/10 text-green uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-gray-200" />

                  <div className="flex flex-col gap-4">
                    {product.inStock &&
                      product.stock <= LOW_PRODUCT_THRESHOLD && (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 w-fit px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-orange-600">
                          <Clock
                            size={14}
                            strokeWidth={2.5}
                            className="sm:w-4 sm:h-4"
                          />
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                            Almost gone
                          </span>
                        </div>
                      )}

                    <div className="flex gap-3 sm:gap-4 h-12 sm:h-14 w-full">
                      {qtyInCart >= 1 ? (
                        <div className="flex-1 sm:max-w-40 flex items-center justify-between border-2 border-green bg-green/5 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            disabled={isUpdating}
                            onClick={handleDecrement}
                            className="w-10 sm:w-12 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={18} strokeWidth={2.5} />
                          </button>

                          <div className="text-base sm:text-lg font-bold text-verdant-dark flex-1 flex justify-center items-center">
                            {isUpdating ? (
                              <Loader2
                                size={18}
                                strokeWidth={3}
                                className="animate-spin text-green"
                              />
                            ) : (
                              qtyInCart
                            )}
                          </div>

                          <button
                            disabled={
                              isStockLimitReached ||
                              isCartLimitReached ||
                              isUpdating
                            }
                            onClick={handleIncrement}
                            className="w-10 sm:w-12 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={!product.inStock || isUpdating}
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 sm:max-w-40 bg-green text-white rounded-xl h-full font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-green-mid transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 animate-in fade-in duration-200"
                        >
                          {isUpdating ? (
                            <Loader2
                              size={18}
                              strokeWidth={2.5}
                              className="animate-spin"
                            />
                          ) : product.inStock ? (
                            "Add to Basket"
                          ) : (
                            "Out of Stock"
                          )}
                        </button>
                      )}

                      <button
                        onClick={toggle}
                        disabled={isToggling}
                        className={`w-12 sm:w-14 h-full rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          wishlisted
                            ? "border-orange-500 bg-orange-50 text-orange-500"
                            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2
                            size={20}
                            strokeWidth={2.5}
                            className="animate-spin text-gray-400 sm:w-6 sm:h-6"
                          />
                        ) : (
                          <Heart
                            size={20}
                            fill={wishlisted ? "currentColor" : "none"}
                            strokeWidth={2.5}
                            className="sm:w-6 sm:h-6"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* ── 🚨 FIX: Unified Mobile 3-Column Grid ── */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      {
                        icon: Sprout,
                        label: "Grown by",
                        value: product.farm,
                      },
                      {
                        icon: MapPin,
                        label: "Origin",
                        value: product.origin,
                      },
                      {
                        icon: Clock,
                        label: "Harvested",
                        value:
                          product.harvestDaysAgo === 0
                            ? "Today"
                            : `${product.harvestDaysAgo} days`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3"
                      >
                        <item.icon
                          className="w-5 h-5 sm:w-6 sm:h-6 text-green flex-shrink-0"
                          strokeWidth={2}
                        />
                        <div className="w-full">
                          <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">
                            {item.label}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-verdant-dark leading-tight line-clamp-2">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4 items-start shadow-sm">
                    <Snowflake
                      className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0"
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 sm:mb-2">
                        Storage Instructions
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
                        {product.storageInstructions}
                      </p>
                    </div>
                  </div>

                  {product.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest border-2 border-gray-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:border-green hover:text-green transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <RelatedProducts slug={slug} product={product} />
          </div>
        </main>
        <Footer />
      </div>
    </Container>
  );
}
