import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface HeroProps {
  featuredProducts: Product[];
}

function discountPct(price: string, original: string) {
  return Math.round((1 - parseFloat(price) / parseFloat(original)) * 100);
}

export default function Hero({ featuredProducts }: HeroProps) {
  const [main, ...rest] = featuredProducts.slice(0, 3);
  const sub = rest.slice(0, 2);

  return (
    <section className="min-h-screen grid grid-cols-2 pt-20">
      {/* ── Left ── */}
      <div className="flex flex-col justify-center px-20 py-16">
        <span className="inline-block text-xs tracking-[0.14em] uppercase text-green border border-green px-4 py-1.5 rounded-full w-fit mb-7 animate-fade-up animation-fill-both">
          🌱 Harvested this morning
        </span>

        <h1 className="font-playfair font-black text-verdant-dark leading-[1.05] text-6xl animate-fade-up animation-fill-both animate-delay-100">
          Farm-Fresh
          <em className="block not-italic text-green">Goodness</em>
          Delivered.
        </h1>

        <p className="mt-6 text-base leading-[1.8] text-verdant-muted max-w-md animate-fade-up animation-fill-both animate-delay-200">
          Straight from local farms to your table — seasonal produce, picked at
          peak ripeness, delivered within 24 hours.
        </p>

        <div className="flex gap-4 mt-9 animate-fade-up animation-fill-both animate-delay-300">
          <Link
            href="/shop"
            className="bg-green text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-green-mid transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(45,106,79,0.28)] inline-flex items-center gap-2"
          >
            Shop Now ↗
          </Link>
          <Link
            href="/farms"
            className="bg-transparent text-verdant-dark border border-[#ccc] px-8 py-4 rounded-full text-sm font-medium hover:border-green hover:text-green transition-all duration-250"
          >
            Our Farms
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-10 mt-12 animate-fade-up animation-fill-both animate-delay-400">
          {[
            { num: "120+", label: "Local Farms" },
            { num: "24h", label: "Harvest to Door" },
            { num: "100%", label: "Traceable Origin" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-playfair text-3xl font-bold text-green leading-none">
                {s.num}
              </div>
              <div className="text-xs text-[#999] mt-1 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Product Cards ── */}
      <div className="bg-green-pale p-4 grid grid-cols-2 grid-rows-2 gap-3">
        {/* Main card — spans 2 rows */}
        {main && (
          <Link
            href={`/product/${main.slug}`}
            className="relative rounded-2xl overflow-hidden row-span-2 group cursor-pointer"
          >
            <Image
              src={main.images[0].url}
              alt={main.images[0].alt}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              {main.isOrganic && (
                <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
                  Organic
                </span>
              )}
              {main.harvestDaysAgo === 0 && (
                <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-white text-green px-2.5 py-1 rounded-full">
                  Today&apos;s Pick
                </span>
              )}
              {main.isOnSale && main.originalPrice && (
                <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-earth text-white px-2.5 py-1 rounded-full">
                  {discountPct(main.price, main.originalPrice)}% off
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-playfair text-white font-bold text-lg leading-tight">
                {main.name}
              </div>
              <div className="text-white/70 text-xs mt-1">
                {main.farm} · {main.origin}
              </div>
              <div className="text-white text-sm font-semibold mt-1.5">
                £{main.price}{" "}
                <span className="text-white/60 text-xs font-normal">{main.unit}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Sub cards */}
        {sub.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >
            <Image
              src={p.images[0].url}
              alt={p.images[0].alt}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            <div className="absolute top-2.5 left-2.5 flex gap-1">
              {p.isOrganic && (
                <span className="text-[0.55rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
                  Organic
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="font-playfair text-white font-bold text-sm leading-tight">
                {p.name}
              </div>
              <div className="text-white text-xs font-semibold mt-1">
                £{p.price}{" "}
                <span className="text-white/60 font-normal">{p.unit}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
