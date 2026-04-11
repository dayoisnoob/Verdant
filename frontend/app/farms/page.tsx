"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAllProducts } from "@/hooks";
import { FARM_ICONS } from "@/lib/constants";
import { ChevronRight, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FarmsSkeleton = () => (
  <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border-2 border-green/10 overflow-hidden"
        >
          <div className="px-6 py-8 border-b-2 border-green/10 bg-green-pale/50 flex flex-col items-start gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl animate-pulse" />
            <div className="w-40 h-6 bg-green/10 rounded-md animate-pulse" />
            <div className="w-24 h-4 bg-green/10 rounded-md animate-pulse" />
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-20 h-3 bg-gray-200 rounded-md animate-pulse mb-2" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="w-1/2 h-4 bg-gray-200 rounded-md animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function FarmsPage() {
  const { data: PRODUCTS, isLoading } = useAllProducts();

  if (!PRODUCTS) return null;

  const farmMap: Record<
    string,
    { origin: string; products: typeof PRODUCTS; isOrganic: boolean }
  > = {};

  if (PRODUCTS) {
    PRODUCTS.forEach((p) => {
      if (!farmMap[p.farm])
        farmMap[p.farm] = { origin: p.origin, products: [], isOrganic: false };
      farmMap[p.farm].products.push(p);
      if (p.isOrganic) farmMap[p.farm].isOrganic = true;
    });
  }

  const farms = Object.entries(farmMap);

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* ── Hero Section ── */}
        <div className="relative h-[400px] sm:h-[450px] overflow-hidden flex flex-col items-center justify-center px-6 text-center">
          <Image
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600&h=500&fit=crop"
            alt="Farm landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-verdant-dark/70 backdrop-blur-[2px]" />

          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-green-light mb-4 bg-green/20 px-4 py-1.5 rounded-full border border-green/30">
              Our Network
            </p>
            <h1 className="font-playfair font-black text-white text-4xl sm:text-5xl md:text-6xl tracking-tight">
              Partner Farms
            </h1>
            <p className="text-gray-300 mt-4 max-w-md text-sm sm:text-base font-medium leading-relaxed">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto opacity-50" />
              ) : (
                `${farms.length} family farms within 60 miles of your door, delivering fresh produce straight from the soil.`
              )}
            </p>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="bg-verdant-dark py-10 px-6 sm:px-10 lg:px-16 xl:px-20 border-b-4 border-green">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x-2 divide-white/10">
            {[
              {
                num: isLoading ? "-" : `${farms.length}+`,
                label: "Partner Farms",
              },
              {
                num: isLoading
                  ? "-"
                  : `${PRODUCTS?.filter((p) => p.isOrganic).length || 0}`,
                label: "Organic Products",
              },
              { num: "60mi", label: "Max Distance" },
              { num: "24h", label: "Harvest to Door" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 sm:px-8">
                <div className="font-playfair text-3xl sm:text-4xl font-black text-white mb-2">
                  {s.num}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Farms Grid ── */}
        {isLoading ? (
          <FarmsSkeleton />
        ) : (
          <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-16 md:py-24 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {farms.map(([name, info]) => (
                <div
                  key={name}
                  id={name.toLowerCase().replace(/\s+/g, "-")}
                  className="bg-white rounded-3xl border-2 border-green/10 hover:border-green/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-green-pale px-6 sm:px-8 py-8 border-b-2 border-green/10 flex flex-col items-start relative">
                    {info.isOrganic && (
                      <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest bg-green text-white px-3 py-1.5 rounded-lg shadow-sm">
                        Organic
                      </span>
                    )}

                    <div className="w-14 h-14 bg-white border-2 border-green/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300">
                      {FARM_ICONS[name] ?? "🌿"}
                    </div>

                    <h2 className="font-playfair font-black text-verdant-dark text-2xl leading-tight mb-2">
                      {name}
                    </h2>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green bg-white px-3 py-1.5 rounded-lg border border-green/20">
                      <MapPin size={12} className="text-green" /> {info.origin}
                    </div>
                  </div>

                  {/* Card Body (Products) */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {info.products.length} product
                      {info.products.length !== 1 ? "s" : ""}
                    </p>

                    <div className="flex flex-col gap-3 flex-1">
                      {info.products.slice(0, 4).map((p) => (
                        <Link
                          key={p.slug}
                          href={`/product/${p.slug}`}
                          className="flex items-center justify-between py-1.5 text-sm font-medium text-gray-600 hover:text-green transition-colors"
                        >
                          <span className="truncate pr-4">{p.name}</span>
                          <span className="font-bold text-verdant-dark flex-shrink-0">
                            £{(p.price / 100).toFixed(2)}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {info.products.length > 4 && (
                      <div className="pt-6 mt-4 border-t-2 border-gray-50">
                        <Link
                          href={`/shop?farm=${encodeURIComponent(name)}`}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green hover:text-verdant-dark transition-colors w-fit"
                        >
                          View {info.products.length - 4} more{" "}
                          <ChevronRight size={14} strokeWidth={2.5} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
