import { Product } from "@/types";
import { ArrowRight, Clock, MapPin, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  featuredProducts: Product[];
}

const heroProduct = (products: Product[]) => {
  if (!products?.length) return null;
  return products[Math.floor(Math.random() * products.length)];
};

export default function Hero({ featuredProducts }: HeroProps) {
  const hero = heroProduct(featuredProducts);
  if (!hero) return null;

  return (
    <section className="relative w-full flex flex-col lg:flex-row bg-cream border-b border-gray-200 min-h-[calc(100vh-96px)]">
      <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 lg:py-24 z-10">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-green bg-green/10 px-4 py-2 rounded-lg w-fit mb-8">
          <Clock size={14} />
          Harvested this morning
        </div>

        <h1 className="font-playfair font-black text-verdant-dark leading-[1.05] text-[clamp(2.5rem,5vw,5rem)] tracking-tight">
          Farm&#8209;Fresh
          <br />
          <span className="text-green">Goodness,</span>
          <br />
          Delivered.
        </h1>

        <p className="mt-6 text-gray-600 font-medium text-base leading-relaxed max-w-md">
          Seasonal produce picked at peak ripeness — traced to the exact field
          it came from, at your door within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/shop"
            className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-green-mid transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Shop Now <ArrowRight size={18} />
          </Link>
          <Link
            href="/farms"
            className="bg-white border-2 border-gray-200 text-verdant-dark px-8 py-4 rounded-xl text-sm font-bold hover:border-gray-300 transition-all flex items-center justify-center"
          >
            Our Farms
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-gray-200 max-w-lg">
          {[
            { num: "120+", label: "Local Farms" },
            { num: "24h", label: "Field to Door" },
            { num: "100%", label: "Traceable" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-playfair text-3xl lg:text-4xl font-black text-verdant-dark mb-2">
                {s.num}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative w-full min-h-[500px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
        <Image
          src={hero.images[0].url}
          alt={hero.images[0].alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        <div className="absolute top-6 right-6 lg:top-8 lg:right-8 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
          <MapPin size={16} className="text-green" />
          <span className="text-xs font-bold text-verdant-dark uppercase tracking-wider">
            {hero.origin}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto sm:w-80 lg:bottom-12 lg:left-12 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 truncate">
                {hero.farm}
              </div>
              <div className="font-playfair font-bold text-verdant-dark text-lg leading-snug truncate">
                {hero.name}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-playfair font-black text-green text-xl leading-none">
                £{(hero.price / 100).toFixed(2)}
              </div>
              <div className="text-[11px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">
                {hero.unit}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {hero.isOrganic && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Sprout size={12} /> Organic
                </span>
              )}
              {hero.harvestDaysAgo === 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-verdant-dark px-2.5 py-1 rounded-md">
                  Today&apos;s Pick
                </span>
              )}
            </div>
            <Link
              href={`/product/${hero.slug}`}
              className="text-[11px] font-bold uppercase tracking-wider text-green hover:text-green-mid transition-colors flex items-center gap-1 flex-shrink-0 ml-4"
            >
              View <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
