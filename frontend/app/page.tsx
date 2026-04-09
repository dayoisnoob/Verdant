"use client";

import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProductSection from "@/components/ProductSection";
import { FeaturedSkeleton, HeroSkeleton } from "@/components/Skeletons";
import { getBestSelling, getPaginatedProducts, getTrending } from "@/lib/api";
import { useAuthStore } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import { Recycle, Sprout, Tractor } from "lucide-react";

export default function HomePage() {
  console.log(useAuthStore.getState().accessToken);
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

  const featuredProducts = data?.products ?? [];

  const isContentEmpty =
    !featuredLoading && (!featuredProducts || featuredProducts.length === 0);

  if (isError) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <ErrorState
            message="Check your connection and try again."
            onRetry={refetch}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <Container>
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 pt-24 pb-20 flex flex-col gap-12 lg:gap-16">
          {featuredLoading ? (
            <HeroSkeleton />
          ) : isContentEmpty ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-4 sm:mx-8 md:mx-16 lg:mx-20 py-32 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-green/5 rounded-full flex items-center justify-center mb-6 border border-green/10">
                <Sprout className="w-8 h-8 text-green" />
              </div>
              <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
                No produce yet
              </h2>
              <p className="text-gray-500 text-sm mt-3 max-w-sm font-medium">
                Looks like the fields are still being prepared. Check back soon
                for our fresh harvest.
              </p>
            </div>
          ) : (
            <Hero featuredProducts={featuredProducts} />
          )}

          {!isContentEmpty && (
            <div className="flex flex-col gap-12 lg:gap-16">
              {featuredLoading ? (
                <FeaturedSkeleton />
              ) : (
                <ProductSection
                  label="Staff Picks"
                  title="This Week's Best"
                  products={featuredProducts}
                />
              )}

              {trendingLoading ? (
                <FeaturedSkeleton />
              ) : trending?.length === 0 ? null : (
                <ProductSection
                  label="Right Now"
                  title="Trending Produce"
                  description="What our customers keep coming back for — picked fresh, delivered to your door."
                  products={trending ?? []}
                />
              )}

              {bestSellingLoading ? (
                <FeaturedSkeleton />
              ) : (
                <ProductSection
                  label="Customer Favourites"
                  title="Best Selling Produce"
                  description="What everyone's adding to their basket this week — before it sells out."
                  products={bestSelling ?? []}
                />
              )}
            </div>
          )}

          <div className="bg-green rounded-2xl mx-4 sm:mx-8 md:mx-16 lg:mx-20 px-8 py-12 sm:px-12 lg:px-16 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {[
                {
                  icon: Sprout,
                  title: "Same-day harvest",
                  desc: "Produce is picked the morning it ships. No warehouses, no cold storage.",
                },
                {
                  icon: Tractor,
                  title: "Traced to the field",
                  desc: "Every item links back to the specific farm and harvest date.",
                },
                {
                  icon: Recycle,
                  title: "Zero-waste packaging",
                  desc: "Compostable boxes, no plastic. Good for you, better for the soil.",
                },
              ].map((v) => (
                <div key={v.title} className="flex flex-col items-start gap-4">
                  <v.icon
                    className="w-7 h-7 text-green-light"
                    strokeWidth={2}
                  />
                  <div>
                    <h3 className="font-bold text-white text-base mb-2">
                      {v.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed font-medium">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-4 sm:mx-8 md:mx-16 lg:mx-20 px-6 py-16 sm:px-12 lg:px-20">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-4">
                Harvest Notes
              </p>
              <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl mb-4">
                What&apos;s growing this week
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 font-medium">
                Weekly updates on what&apos;s in season, which farms are
                harvesting, and early access to limited produce — straight to
                your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 border border-gray-200 bg-gray-50/50 rounded-xl px-5 py-4 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/10 transition-all hover:bg-white text-verdant-dark placeholder:text-gray-400 font-medium"
                />
                <button
                  type="submit"
                  className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-green-mid transition-all shadow-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[11px] font-bold text-gray-400 mt-5 uppercase tracking-wider">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </Container>
  );
}
