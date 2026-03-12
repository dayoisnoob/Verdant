"use client";

import Link from "next/link";

import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { FeaturedSkeleton, HeroSkeleton } from "@/components/Skeletons";
import { ErrorState } from "@/components/ErrorState";

export default function HomePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(undefined, undefined, undefined, 1, 999),
  });

  const PRODUCTS = data?.products;

  if (isLoading) {
    return (
      <>
        <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
        <Navbar />
        <main>
          <HeroSkeleton />
          <FeaturedSkeleton />
        </main>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Check your connection and try again."
          }
          onRetry={refetchProduct}
        />
        <Footer />
      </>
    );
  }

  if (!PRODUCTS || PRODUCTS.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center gap-5">
          <span className="text-5xl">🌱</span>
          <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
            No produce yet
          </h2>
          <p className="text-verdant-muted text-sm max-w-sm">
            Looks like the fields are being prepared. Check back soon.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured);

  return (
    <Container>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <Navbar />

      <main className="bg-cream flex flex-col gap-3">
        {/* ── Hero ── */}
        <div>
          <Hero hero={featuredProducts[0]} />
        </div>

        {/* ── Featured ── */}
        <div className="bg-white rounded-2xl mx-4 px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-2">
                Staff Picks
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl">
                This Week&apos;s Best
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-green text-sm font-medium hover:opacity-65 transition-opacity self-start sm:self-auto"
            >
              Browse all produce →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-verdant-muted text-sm">
              No featured products right now.{" "}
              <Link
                href="/shop"
                className="text-green font-medium hover:underline"
              >
                Browse everything →
              </Link>
            </div>
          )}
        </div>

        {/* ── Best Selling ── */}
        <div className="bg-white rounded-2xl mx-4 px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-2">
                Customer Favourites
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl">
                Best Selling Produce
              </h2>
              <p className="text-verdant-muted text-sm mt-2 max-w-sm">
                What our customers keep coming back for — picked fresh,
                delivered to your door.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-green text-sm font-medium hover:opacity-65 transition-opacity self-start sm:self-auto"
            >
              Browse all produce →
            </Link>
          </div>

          {PRODUCTS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRODUCTS.slice(4, 12).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-verdant-muted text-sm">
              No featured products right now.{" "}
              <Link
                href="/shop"
                className="text-green font-medium hover:underline"
              >
                Browse everything →
              </Link>
            </div>
          )}
        </div>

        {/* ── Trending ── */}
        <div className="bg-white rounded-2xl mx-4 px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-2">
                Right Now
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl">
                Trending Produce
              </h2>
              <p className="text-verdant-muted text-sm mt-2 max-w-sm">
                What everyone&apos;s adding to their basket this week — before
                it sells out.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-green text-sm font-medium hover:opacity-65 transition-opacity self-start sm:self-auto"
            >
              Browse all produce →
            </Link>
          </div>

          {PRODUCTS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRODUCTS.slice(12, 20).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-verdant-muted text-sm">
              No trending products right now.{" "}
              <Link
                href="/shop"
                className="text-green font-medium hover:underline"
              >
                Browse everything →
              </Link>
            </div>
          )}
        </div>

        {/* ── Trust strip ── */}
        <div className="bg-green rounded-2xl mx-4 px-6 py-10 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                icon: "🌱",
                title: "Same-day harvest",
                desc: "Produce is picked the morning it ships. No warehouses, no cold storage.",
              },
              {
                icon: "🚜",
                title: "Traced to the field",
                desc: "Every item links back to the specific farm and harvest date.",
              },
              {
                icon: "♻️",
                title: "Zero-waste packaging",
                desc: "Compostable boxes, no plastic. Good for you, better for the soil.",
              },
            ].map((v) => (
              <div key={v.title} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{v.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">
                    {v.title}
                  </div>
                  <p className="text-white/65 text-xs leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div className="bg-white rounded-2xl mx-4 px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-3">
              Harvest Notes
            </p>
            <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl mb-4">
              What&apos;s growing this week
            </h2>
            <p className="text-verdant-muted text-sm leading-relaxed mb-8">
              Weekly updates on what&apos;s in season, which farms are
              harvesting, and early access to limited produce — straight to your
              inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 border border-[#e0e0e0] bg-white rounded-full px-5 py-3.5 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all text-verdant-dark placeholder:text-[#ccc]"
              />
              <button className="bg-green text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-[0.65rem] text-[#bbb] mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div>
          <Footer />
        </div>
      </main>
    </Container>
  );
}
