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

  const { toggle, wishlisted } = useWishlistToggle(product?.id ?? "");

  if (isLoading) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">
              Loading product...
            </p>
          </div>
        </main>
        <Footer />
      </div>
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
            <div className="px-6 sm:px-10 lg:px-16 xl:px-20 mb-6">
              <nav className="flex items-center flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 py-4">
                <Link href="/" className="hover:text-green transition-colors">
                  Home
                </Link>
                <ChevronRight size={12} />
                <Link
                  href="/shop"
                  className="hover:text-green transition-colors"
                >
                  Shop
                </Link>
                <ChevronRight size={12} />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-green transition-colors"
                >
                  {product.category}
                </Link>
                <ChevronRight size={12} />
                <span className="text-verdant-dark">{product.name}</span>
              </nav>
            </div>

            <div className="px-6 sm:px-10 lg:px-16 xl:px-20 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 lg:sticky lg:top-28">
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-50 border border-gray-100">
                    <BlurImage
                      src={product.images[activeImg]?.url}
                      alt={product.images[activeImg]?.alt || "Product image"}
                      fill
                      priority
                      className="object-cover"
                    />

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-white text-gray-600 font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-xl border-2 border-gray-200 shadow-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isOrganic && (
                        <span className="text-xs font-bold uppercase tracking-wider bg-green text-white px-4 py-2 rounded-xl shadow-sm">
                          Organic
                        </span>
                      )}
                      {discountPct && (
                        <span className="text-xs font-bold uppercase tracking-wider bg-orange-500 text-white px-4 py-2 rounded-xl shadow-sm">
                          {discountPct}% off
                        </span>
                      )}
                      {product.harvestDaysAgo === 0 && (
                        <span className="text-xs font-bold uppercase tracking-wider bg-white text-green border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                          Harvested today
                        </span>
                      )}
                    </div>

                    {product.harvestDaysAgo !== undefined &&
                      product.harvestDaysAgo <= 3 && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Harvested
                          </p>
                          <p className="text-sm font-bold text-verdant-dark">
                            {product.harvestDaysAgo === 0
                              ? "Today"
                              : `${product.harvestDaysAgo} days ago`}
                          </p>
                        </div>
                      )}
                  </div>

                  {product.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
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

                <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-8 py-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-verdant-dark bg-gray-100 px-3 py-1.5 rounded-md">
                        {product.farm}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <MapPin size={14} />
                        {product.origin}
                      </span>
                    </div>

                    <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl lg:text-6xl leading-none mb-4 tracking-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-3">
                      <StarRating rating={product.rating} />
                      <span className="text-sm font-bold text-verdant-dark">
                        {product.rating}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        ({product.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-4">
                    <span className="font-playfair font-black text-verdant-dark text-5xl sm:text-6xl leading-none">
                      £{(product.price / 100).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-2xl font-bold text-gray-300 line-through mb-1">
                        £{(product.originalPrice / 100).toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">
                      {product.unit}
                    </span>
                  </div>

                  <p className="text-base font-medium text-gray-600 leading-relaxed max-w-2xl">
                    {product.description}
                  </p>

                  {product.nutritionHighlights?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.nutritionHighlights.map((n) => (
                        <span
                          key={n}
                          className="text-[11px] font-bold bg-green/10 text-green uppercase tracking-widest px-4 py-2 rounded-lg"
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
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 w-fit px-4 py-2 rounded-xl text-orange-600">
                          <Clock size={16} strokeWidth={2.5} />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Almost gone
                          </span>
                        </div>
                      )}

                    {/* ── Add to Cart / Quantity Selector ── */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch h-14">
                      {qtyInCart >= 1 ? (
                        <div className="flex items-center justify-between border-2 border-green bg-green/5 rounded-xl overflow-hidden w-full sm:w-40 flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            disabled={isUpdating}
                            onClick={handleDecrement}
                            className="w-12 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={18} strokeWidth={2.5} />
                          </button>

                          <div className="text-lg font-bold text-verdant-dark w-12 flex justify-center items-center">
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
                            className="w-12 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={!product.inStock || isUpdating}
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 sm:w-40 bg-green text-white rounded-xl h-full font-bold text-sm tracking-widest uppercase hover:bg-green-mid transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 animate-in fade-in duration-200"
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
                        className={`w-14 h-full rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          wishlisted
                            ? "border-orange-500 bg-orange-50 text-orange-500"
                            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
                        }`}
                      >
                        <Heart
                          size={24}
                          fill={wishlisted ? "currentColor" : "none"}
                          strokeWidth={2.5}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            : `${product.harvestDaysAgo} days ago`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3"
                      >
                        <item.icon
                          className="w-6 h-6 text-green"
                          strokeWidth={2}
                        />
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {item.label}
                          </div>
                          <div className="text-sm font-bold text-verdant-dark leading-snug break-words">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
                    <Snowflake
                      className="w-8 h-8 text-blue-400 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Storage Instructions
                      </p>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        {product.storageInstructions}
                      </p>
                    </div>
                  </div>

                  {product.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-bold text-gray-500 uppercase tracking-widest border-2 border-gray-200 bg-white px-4 py-2 rounded-lg hover:border-green hover:text-green transition-colors cursor-pointer"
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
