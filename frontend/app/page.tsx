"use client";

import Link from "next/link";

import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#e8e8e8] rounded-lg ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cream pt-20">
      {/* Left copy */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-14 sm:px-12 lg:px-20 lg:py-0 gap-5">
        <Shimmer className="h-6 w-44 rounded-full" />
        <div className="flex flex-col gap-3">
          <Shimmer className="h-14 w-4/5 rounded-xl" />
          <Shimmer className="h-14 w-3/5 rounded-xl" />
          <Shimmer className="h-14 w-2/3 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Shimmer className="h-4 w-full rounded-md" />
          <Shimmer className="h-4 w-5/6 rounded-md" />
          <Shimmer className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="flex gap-3 mt-2">
          <Shimmer className="h-12 w-32 rounded-full" />
          <Shimmer className="h-12 w-28 rounded-full" />
        </div>
        <div className="flex gap-8 mt-6 pt-8 border-t border-black/8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Shimmer className="h-8 w-16 rounded-md" />
              <Shimmer className="h-3 w-14 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      {/* Right image panel */}
      <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-auto">
        <Shimmer className="w-full h-full rounded-none" />
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <Shimmer className="h-48 w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Shimmer className="h-3 w-24 rounded-sm" />
        <Shimmer className="h-5 w-4/5 rounded-md" />
        <Shimmer className="h-3 w-1/3 rounded-sm" />
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Shimmer key={s} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          <Shimmer className="h-4 w-14 rounded-full" />
          <Shimmer className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-4 mt-1 border-t border-[#f0f0f0]">
          <div className="flex flex-col gap-1.5">
            <Shimmer className="h-5 w-12 rounded-md" />
            <Shimmer className="h-3 w-16 rounded-sm" />
          </div>
          <Shimmer className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
        <div className="flex flex-col gap-3">
          <Shimmer className="h-3 w-20 rounded-sm" />
          <Shimmer className="h-9 w-52 rounded-lg" />
        </div>
        <Shimmer className="h-4 w-36 rounded-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center gap-5">
      <span className="text-5xl">🌧️</span>
      <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
        Something went wrong
      </h2>
      <p className="text-verdant-muted text-sm max-w-sm leading-relaxed">
        {message || "We couldn't load the produce. Try refreshing the page."}
      </p>
      <button
        onClick={onRetry}
        className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all"
      >
        Refresh
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(undefined, undefined, undefined, 1, 999),
  });

  const PRODUCTS = data?.products;

  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes shimmer { to { transform: translateX(200%); } }
        `}</style>
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
      <style>{`
        @keyframes shimmer { to { transform: translateX(200%); } }
      `}</style>
      <Navbar />

      <main>
        <Hero hero={featuredProducts[0]} />

        <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
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
        </section>

        {/* {Best Selling} */}
        <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
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
        </section>

        {/* {Trending} */}
        <section className="bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
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
        </section>

        <section className="bg-green px-6 py-10 sm:px-10 lg:px-20">
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
        </section>

        <section className="bg-cream px-6 py-16 sm:px-10 sm:py-20 lg:px-20 lg:py-24">
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
        </section>
      </main>

      <Footer />
    </Container>
  );
}
