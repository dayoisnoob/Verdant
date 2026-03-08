"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getProducts } from "@/lib/api";
import { useCartStore } from "@/store/store";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

function StarRating({ rating }: { rating: string }) {
  const r = parseFloat(rating);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill={star <= Math.round(r) ? "#F59E0B" : "#D1D5DB"}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product"],
    queryFn: async () => {
      const res = await getProductBySlug(slug);
      return res.data;
    },
  });

  const { data: PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts(undefined, undefined, 1, 20);
      return res.data;
    },
  });

  if (isLoading)
    return (
      <>
        <Navbar />
        <main className="pt-24 bg-cream min-h-screen flex items-center justify-center">
          <div className="text-verdant-muted">Loading…</div>
        </main>
        <Footer />
      </>
    );

  if (!product) notFound();

  const related = PRODUCTS?.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const handleAddToCart = (product: Product) => {
    console.log("trying to add", product);
    addItem(product, qty);
    toast.success("Product successfully added to cart");
  };

  const discountPct = product.originalPrice
    ? Math.round(
        (1 - parseFloat(product.price) / parseFloat(product.originalPrice)) *
          100,
      )
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-24 bg-cream min-h-screen">
        {/* Breadcrumb */}
        <div className="px-20 py-4 flex items-center gap-2 text-xs text-[#aaa]">
          <Link href="/" className="hover:text-green transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-green transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-green transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-verdant-text">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="px-20 py-10 grid grid-cols-2 gap-16">
          {/* Images */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-green" : "border-transparent"
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

            {/* Main image */}
            <div className="relative flex-1 rounded-2xl overflow-hidden aspect-[3/4]">
              <Image
                src={product.images[activeImg].url}
                alt={product.images[activeImg].alt}
                fill
                className="object-cover transition-opacity duration-300"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-white text-red-700 font-semibold px-6 py-3 rounded-full shadow">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="py-4">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap mb-4">
              {product.isOrganic && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-green text-white px-3 py-1 rounded-full">
                  Organic
                </span>
              )}
              {product.isSeasonal && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  Seasonal
                </span>
              )}
              {product.isOnSale && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-earth text-white px-3 py-1 rounded-full">
                  {discountPct}% off
                </span>
              )}
              {product.harvestDaysAgo === 0 && (
                <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-green-pale text-green px-3 py-1 rounded-full">
                  Harvested Today
                </span>
              )}
            </div>

            <div className="text-xs text-[#aaa] uppercase tracking-widest mb-1">
              {product.farm}
            </div>
            <h1 className="font-playfair font-black text-verdant-dark text-4xl leading-tight">
              {product.name}
            </h1>
            <div className="text-green text-xs mt-1">📍 {product.origin}</div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[#888]">
                {product.rating} · {product.reviewCount.toLocaleString()}{" "}
                reviews
              </span>
            </div>

            <p className="text-verdant-muted text-[0.95rem] leading-[1.85] mt-5">
              {product.description}
            </p>

            {/* Nutrition */}
            <div className="flex gap-2 flex-wrap mt-5">
              {product.nutritionHighlights.map((n) => (
                <span
                  key={n}
                  className="text-xs bg-green-pale text-green px-3 py-1.5 rounded-full"
                >
                  {n}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-playfair text-4xl font-bold text-green">
                £{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-[#bbb] line-through">
                  £{product.originalPrice}
                </span>
              )}
              <span className="text-sm text-[#aaa]">{product.unit}</span>
            </div>

            {/* Qty + Add */}
            <div className="flex gap-4 mt-7">
              <div className="flex items-center border border-[#ddd] rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-5 py-3 text-verdant-text hover:bg-green-pale transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="px-4 font-medium text-verdant-dark min-w-[2rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-5 py-3 text-verdant-text hover:bg-green-pale transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
              <button
                disabled={!product.inStock}
                onClick={() => handleAddToCart(product)}
                className="flex-1 bg-green text-white rounded-full py-3 font-medium hover:bg-green-mid hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.3)] transition-all duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {product.inStock ? "Add to Basket" : "Out of Stock"}
              </button>
            </div>

            {/* Storage */}
            <div className="mt-7 p-5 bg-green-pale rounded-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-green mb-1">
                Storage
              </div>
              <p className="text-sm text-verdant-muted">
                {product.storageInstructions}
              </p>
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mt-5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-[#aaa] border border-[#e5e5e5] px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {(related?.length ?? 0) > 0 && (
          <div className="px-20 py-16 border-t border-green/10">
            <h2 className="font-playfair font-black text-verdant-dark text-3xl mb-8">
              More from {product.category}
            </h2>
            <div className="grid grid-cols-4 gap-6">
              {related?.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
