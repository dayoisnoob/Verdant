import Image from "next/image";
import Link from "next/link";
import { CATEGORY_META } from "@/data/products";

interface CategoryGridProps {
  categories: { name: string; count: number; organicCount: number }[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const top5 = categories.slice(0, 5);

  return (
    <section className="px-20 py-22">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Browse by Category
          </p>
          <h2 className="font-playfair font-black text-verdant-dark text-4xl leading-[1.15]">
            What&apos;s in
            <br />
            Season Now
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-green text-sm font-medium border-b border-green pb-px hover:opacity-65 transition-opacity whitespace-nowrap"
        >
          View all categories →
        </Link>
      </div>

      {/* Bento Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "2fr 1fr 1fr",
          gridTemplateRows: "240px 240px",
        }}
      >
        {top5.map((cat, i) => {
          const meta = CATEGORY_META[cat.name];
          const isMain = i === 0;

          return (
            <Link
              key={cat.name}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="relative rounded-[18px] overflow-hidden group cursor-pointer"
              style={{ gridRow: isMain ? "span 2" : "span 1" }}
            >
              {meta?.img && (
                <Image
                  src={meta.img}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-[1.06]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              {cat.organicCount > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
                    Organic
                  </span>
                </div>
              )}

              <div className="absolute bottom-5 left-5">
                <div className="font-playfair text-white font-bold text-xl leading-tight">
                  {cat.name}
                </div>
                <div className="text-white/70 text-xs mt-1">
                  {cat.count} product{cat.count !== 1 ? "s" : ""} · {cat.organicCount} organic
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
