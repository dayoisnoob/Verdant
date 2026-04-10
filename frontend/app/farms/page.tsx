"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FARM_ICONS } from "@/lib/constants";
import { useAllProducts } from "@/hooks";

export default function FarmsPage() {
  const { data: PRODUCTS } = useAllProducts();

  if (!PRODUCTS) return null;

  const farmMap: Record<
    string,
    { origin: string; products: typeof PRODUCTS; isOrganic: boolean }
  > = {};
  PRODUCTS.forEach((p) => {
    if (!farmMap[p.farm])
      farmMap[p.farm] = { origin: p.origin, products: [], isOrganic: false };
    farmMap[p.farm].products.push(p);
    if (p.isOrganic) farmMap[p.farm].isOrganic = true;
  });
  const farms = Object.entries(farmMap);
  return (
    <>
      <Navbar />
      <main className="pt-24 bg-cream min-h-screen">
        <div className="relative h-72 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600&h=500&fit=crop"
            alt="Farm landscape"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-dark/50 to-green/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-green-pale mb-3">
              Our Network
            </p>
            <h1 className="font-playfair font-black text-white text-5xl">
              Partner Farms
            </h1>
            <p className="text-white/75 mt-3 max-w-md">
              {farms.length} family farms within 60 miles of your door.
            </p>
          </div>
        </div>

        <div className="bg-green py-8 px-20 grid grid-cols-4 divide-x divide-white/20">
          {[
            { num: `${farms.length}+`, label: "Partner Farms" },
            {
              num: `${PRODUCTS.filter((p) => p.isOrganic).length}`,
              label: "Organic Products",
            },
            { num: "60mi", label: "Max Distance" },
            { num: "24h", label: "Harvest to Door" },
          ].map((s) => (
            <div key={s.label} className="text-center px-8">
              <div className="font-playfair text-3xl font-bold text-white">
                {s.num}
              </div>
              <div className="text-white/60 text-xs uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="px-20 py-20 grid grid-cols-3 gap-8">
          {farms.map(([name, info]) => (
            <div
              key={name}
              id={name.toLowerCase().replace(/\s+/g, "-")}
              className="bg-white rounded-2xl overflow-hidden border border-green/10 hover:shadow-[0_8px_32px_rgba(45,106,79,0.12)] transition-all duration-300"
            >
              <div className="bg-green-pale px-6 pt-8 pb-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-4">
                  {FARM_ICONS[name] ?? "🌿"}
                </div>
                <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                  {name}
                </h2>
                <p className="text-green text-sm mt-1">📍 {info.origin}</p>
                {info.isOrganic && (
                  <span className="inline-block mt-2 text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
                    Organic Certified
                  </span>
                )}
              </div>

              <div className="px-6 py-5">
                <p className="text-xs uppercase tracking-wider text-[#aaa] mb-3">
                  {info.products.length} product
                  {info.products.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-col gap-2">
                  {info.products.slice(0, 4).map((p) => (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      className="flex items-center justify-between py-1.5 text-sm text-verdant-text hover:text-green transition-colors group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {p.name}
                      </span>
                      <span className="text-green font-medium">£{p.price}</span>
                    </Link>
                  ))}
                  {info.products.length > 4 && (
                    <Link
                      href={`/shop?farm=${encodeURIComponent(name)}`}
                      className="text-xs text-green hover:opacity-70 transition-opacity mt-1"
                    >
                      +{info.products.length - 4} more products →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
