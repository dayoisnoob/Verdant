"use client";

import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProductSection from "@/components/ProductSection";
import { FeaturedSkeleton, HeroSkeleton } from "@/components/Skeletons";
import { getBestSelling, getPaginatedProducts, getTrending } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const {
    data,
    isLoading: featuredLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getPaginatedProducts(undefined, undefined, "featured", 1, 4),
  });
  const { data: bestSelling, isLoading: bestSellingLoading } = useQuery({
    queryKey: ["best-selling"],
    queryFn: getBestSelling,
  });
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  });

  const featuredProducts = data?.products;

  if (featuredLoading)
    return (
      <>
        <Navbar />
        <HeroSkeleton />
        <FeaturedSkeleton />
        <Footer />
      </>
    );

  if (isError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="Check your connection and try again."
          onRetry={refetch}
        />
        <Footer />
      </>
    );
  }

  if (!featuredProducts?.length) {
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

  return (
    <Container>
      <Navbar />

      <main className="bg-cream flex flex-col gap-3">
        {/* ── Hero ── */}
        <div>
          <Hero hero={featuredProducts[0]} />
        </div>

        {/* ── Featured ── */}
        {featuredLoading ? (
          <FeaturedSkeleton />
        ) : (
          <ProductSection
            label="Staff Picks"
            title="This Week's Best"
            products={featuredProducts}
          />
        )}

        {/* ── Trending ── */}
        {trendingLoading ? (
          <FeaturedSkeleton />
        ) : (
          <ProductSection
            label="Right Now"
            title="Trending Produce"
            description="What our customers keep coming back for — picked fresh,
                delivered to your door."
            products={trending ?? []}
          />
        )}

        {/* ── Best Selling ── */}
        {bestSellingLoading ? (
          <FeaturedSkeleton />
        ) : (
          <ProductSection
            label="Customer Favourites"
            title=" Best Selling Produce"
            description="What everyone's adding to their basket this week — before
                it sells out."
            products={bestSelling ?? []}
          />
        )}

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

        <div>
          <Footer />
        </div>
      </main>
    </Container>
  );
}
