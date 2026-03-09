"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { useWishlist, useWishlistToggle } from "@/hooks";
import { getProductBySlug, getProducts } from "@/lib/api";
import { useCartStore } from "@/store/store";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { wishlist } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);

  const isWishlisted = wishlist.some((i) => i.slug === slug);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await getProductBySlug(slug)).data,
  });

  const { data: PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await getProducts(undefined, undefined, 1, 20)).data,
  });

  const { toggle } = useWishlistToggle(product?.id ?? "", isWishlisted);

  if (isLoading)
    return (
      <>
        <Navbar />
        <main className="pt-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-green-pale" />
            <div className="absolute inset-0 rounded-full border-[3px] border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
        </main>
        <Footer />
      </>
    );

  if (!product) notFound();

  const related = PRODUCTS?.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const discountPct = product.originalPrice
    ? Math.round(
        (1 - parseFloat(product.price) / parseFloat(product.originalPrice)) *
          100,
      )
    : null;

  const handleAddToCart = (p: Product) => {
    addItem(p, qty);
    toast.success(`${p.name} added to basket`);
  };

  return (
    <>
      <Navbar />

      <main className="bg-cream min-h-screen">
        {/* ── Breadcrumb ── */}
        <div className="pt-24 px-4 sm:px-8 md:px-16 lg:px-20">
          <nav className="flex items-center gap-2 text-[0.7rem] text-[#bbb] py-4">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              {
                label: product.category,
                href: `/shop?category=${encodeURIComponent(product.category)}`,
              },
            ].map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                <Link
                  href={crumb.href}
                  className="hover:text-green transition-colors"
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
            <span>/</span>
            <span className="text-verdant-muted">{product.name}</span>
          </nav>
        </div>

        {/* ── Hero product grid ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 xl:gap-16 items-start">
            {/* ── Left — Image gallery ── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-28">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#f0ede6]">
                <Image
                  src={product.images[activeImg]?.url}
                  alt={product.images[activeImg]?.alt}
                  fill
                  priority
                  className="object-cover transition-opacity duration-300"
                />

                {/* Out of stock overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-white text-red-500 font-semibold text-sm px-6 py-3 rounded-full shadow-sm border border-red-100">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Floating badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isOrganic && (
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full shadow-sm">
                      Organic
                    </span>
                  )}
                  {discountPct && (
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-orange text-white px-2.5 py-1 rounded-full shadow-sm">
                      {discountPct}% off
                    </span>
                  )}
                  {product.harvestDaysAgo === 0 && (
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-white text-green px-2.5 py-1 rounded-full shadow-sm">
                      Harvested today
                    </span>
                  )}
                </div>

                {/* Harvest freshness indicator — bottom left */}
                {product.harvestDaysAgo !== undefined &&
                  product.harvestDaysAgo <= 3 && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-sm">
                      <p className="text-[0.6rem] text-verdant-muted uppercase tracking-wider">
                        Harvested
                      </p>
                      <p className="text-xs font-bold text-verdant-dark">
                        {product.harvestDaysAgo === 0
                          ? "Today"
                          : `${product.harvestDaysAgo}d ago`}
                      </p>
                    </div>
                  )}
              </div>

              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                        activeImg === i
                          ? "border-green shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right — Product info ── */}
            <div className="flex flex-col gap-6 py-2">
              {/* Farm + category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-verdant-muted">
                    {product.farm}
                  </span>
                  <span className="text-[#ddd]">·</span>
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category)}`}
                    className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-green hover:underline"
                  >
                    {product.category}
                  </Link>
                </div>

                <h1 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl xl:text-5xl leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-verdant-muted">
                  <span>📍</span>
                  <span>{product.origin}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} />
                <span className="text-sm font-semibold text-verdant-dark">
                  {product.rating}
                </span>
                <span className="text-xs text-verdant-muted">
                  {product.reviewCount.toLocaleString()} reviews
                </span>
              </div>

              {/* Description */}
              <p className="text-[0.92rem] text-verdant-muted leading-[1.9]">
                {product.description}
              </p>

              {/* Nutrition chips */}
              {product.nutritionHighlights?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {product.nutritionHighlights.map((n) => (
                    <span
                      key={n}
                      className="text-xs bg-green-pale text-green font-medium px-3 py-1.5 rounded-full"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-[#ebebeb]" />

              {/* Price block */}
              <div className="flex items-baseline gap-3">
                <span className="font-playfair font-black text-black text-4xl md:text-5xl">
                  £{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-[#ccc] line-through font-medium">
                    £{product.originalPrice}
                  </span>
                )}
                <span className="text-sm text-verdant-muted ml-1">
                  {product.unit}
                </span>
              </div>

              {/* Add to basket */}
              <div className="flex gap-3 items-stretch">
                {/* Quantity stepper */}
                <div className="flex items-center border-2 border-[#e5e5e5] rounded-full overflow-hidden hover:border-green transition-colors">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-11 h-11 flex items-center justify-center text-verdant-muted hover:text-green hover:bg-green-pale transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-base font-bold text-verdant-dark">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-11 h-11 flex items-center justify-center text-verdant-muted hover:text-green hover:bg-green-pale transition-colors text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Add button */}
                <button
                  disabled={!product.inStock}
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-green text-white rounded-full py-3 font-semibold text-sm tracking-wide hover:bg-green-mid hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.3)] transition-all duration-200 disabled:bg-[#e5e5e5] disabled:text-[#aaa] disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  {product.inStock ? "Add to Basket" : "Out of Stock"}
                </button>

                {/* Wishlist */}
                <button
                  onClick={toggle}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isWishlisted
                      ? "border-orange text-orange"
                      : "border-[#e5e5e5] text-[#ccc] hover:border-orange hover:text-orange"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#ebebeb]" />

              {/* Provenance row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: "🌱",
                    label: "Grown by",
                    value: product.farm.split(" ").slice(0, 2).join(" "),
                  },
                  { icon: "📍", label: "Origin", value: product.origin },
                  {
                    icon: "⏱",
                    label: "Harvested",
                    value:
                      product.harvestDaysAgo === 0
                        ? "Today"
                        : `${product.harvestDaysAgo}d ago`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl p-3.5 border border-green/8"
                  >
                    <div className="text-lg mb-1.5">{item.icon}</div>
                    <div className="text-[0.6rem] text-verdant-muted uppercase tracking-wider mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-xs font-semibold text-verdant-dark truncate">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Storage */}
              <div className="bg-white border border-green/10 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5">🧊</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-verdant-dark mb-1">
                    Storage
                  </p>
                  <p className="text-sm text-verdant-muted leading-relaxed">
                    {product.storageInstructions}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.7rem] text-[#aaa] border border-[#ebebeb] px-3 py-1 rounded-full hover:border-green hover:text-green transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {(related?.length ?? 0) > 0 && (
          <div className="border-t border-green/10 px-4 sm:px-8 md:px-16 lg:px-20 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.15em] uppercase text-green mb-1">
                  You might also like
                </p>
                <h2 className="font-playfair font-black text-verdant-dark text-2xl md:text-3xl">
                  More {product.category}
                </h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-sm text-green font-medium hover:underline hidden sm:block"
              >
                View all →
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0">
              {related?.map((p) => (
                <div key={p.slug} className="min-w-[220px] sm:min-w-0">
                  <ProductCard product={p} isWishlisted={isWishlisted} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
