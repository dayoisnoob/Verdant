import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface HeroProps {
  hero: Product;
}

export default function Hero({ hero }: HeroProps) {
  console.log(hero);
  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cream">
      {/* ── Left — Copy ── */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-1/2 px-6 pt-28 pb-14 sm:px-12 lg:px-20 lg:py-0">
        {/* Live badge */}
        <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.14em] uppercase text-green bg-green/8 border border-green/25 px-4 py-1.5 rounded-full w-fit mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse flex-shrink-0" />
          Harvested this morning
        </span>

        {/* Headline */}
        <h1 className="font-playfair font-black text-verdant-dark leading-[1.02] text-[clamp(2.8rem,6vw,5.5rem)] animate-fade-up">
          Farm&#8209;Fresh
          <br />
          <em className="not-italic text-green font-black">Goodness,</em>
          <br />
          Delivered.
        </h1>

        <p className="mt-6 text-[0.92rem] leading-[1.9] text-verdant-muted max-w-[360px] animate-fade-up">
          Seasonal produce picked at peak ripeness — traced to the exact field
          it came from, at your door within 24 hours.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-9 animate-fade-up">
          <Link
            href="/shop"
            className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(45,106,79,0.3)]"
          >
            Shop Now ↗
          </Link>
          <Link
            href="/farms"
            className="border border-[#ccc] text-verdant-text px-8 py-3.5 rounded-full text-sm font-medium hover:border-green hover:text-green transition-all"
          >
            Our Farms
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12 pt-10 border-t border-black/8">
          {[
            { num: "120+", label: "Local Farms" },
            { num: "24h", label: "Field to Door" },
            { num: "100%", label: "Traceable" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-playfair text-[1.85rem] font-bold text-green leading-none">
                {s.num}
              </div>
              <div className="text-[0.6rem] text-verdant-muted mt-1.5 uppercase tracking-[0.12em]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — Full-bleed image ── */}
      <div className="relative w-full lg:w-1/2 h-72 sm:h-96 lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0">
        <Image
          src={hero.images[0].url}
          alt={hero.images[0].alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Gradient — fades into cream on desktop (left edge), dark at bottom on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r lg:from-cream lg:via-cream/20 lg:to-transparent" />

        {/* Product card — floats bottom-left on desktop, bottom-center on mobile */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto sm:w-72 lg:bottom-12 lg:left-8 bg-white/92 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[0.58rem] uppercase tracking-[0.12em] text-verdant-muted mb-1">
                {hero.farm}
              </div>
              <div className="font-playfair font-bold text-verdant-dark text-[0.95rem] leading-snug">
                {hero.name}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-semibold text-green text-base leading-none">
                £{hero.price}
              </div>
              <div className="text-[0.6rem] text-verdant-muted mt-1">
                {hero.unit}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-black/6 my-3" />

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {hero.isOrganic && (
                <span className="text-[0.58rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
                  Organic
                </span>
              )}
              {hero.harvestDaysAgo === 0 && (
                <span className="text-[0.58rem] font-bold uppercase tracking-wider bg-green-pale text-green px-2.5 py-1 rounded-full">
                  Today&apos;s Pick
                </span>
              )}
            </div>
            <Link
              href={`/product/${hero.slug}`}
              className="text-[0.65rem] text-green font-semibold hover:opacity-65 transition-opacity"
            >
              View →
            </Link>
          </div>
        </div>

        {/* Harvest origin tag — top right corner, desktop only */}
        <div className="hidden lg:flex absolute top-10 right-8 items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <span className="text-base">📍</span>
          <span className="text-[0.65rem] font-medium text-verdant-dark">
            {hero.origin}
          </span>
        </div>
      </div>
    </section>
  );
}
