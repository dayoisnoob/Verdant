import ProductCard from "./ProductCard";
import { ProductCard as PCType } from "@/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ProductSectionProps {
  label: string;
  title: string;
  description?: string;
  products: PCType[];
}

export default function ProductSection({
  label,
  title,
  description,
  products,
}: ProductSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 md:px-16 lg:px-20 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div className="max-w-2xl">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-2 sm:mb-3">
            {label}
          </p>
          <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="text-gray-500 font-medium text-sm mt-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <Link
          href="/shop"
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-green hover:text-green-mid transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          View all <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div
            key={p.slug}
            className="min-w-[240px] sm:min-w-0 snap-center h-full"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
