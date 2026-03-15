import { ProductCard } from "@/types";
import Image from "next/image";
import Link from "next/link";

const MightLike = ({ suggested }: { suggested: ProductCard[] }) => {
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-12 md:py-16 border-t border-green/10">
      <h2 className="font-playfair font-bold text-verdant-dark text-xl md:text-2xl mb-6 md:mb-8">
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {suggested.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="bg-white rounded-2xl overflow-hidden border border-green/10 flex gap-4 p-4 items-center hover:border-green-light hover:shadow-sm transition-all duration-200 group"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={p.images[0].url}
                alt={p.images[0].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.65rem] text-[#aaa] uppercase tracking-wider mb-0.5 hidden sm:block">
                {p.farm}
              </div>
              <div className="font-playfair font-bold text-verdant-dark text-sm md:text-base leading-tight truncate">
                {p.name}
              </div>
              <div className="text-green font-semibold text-sm mt-1">
                £{p.price}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center text-white text-lg flex-shrink-0 group-hover:bg-green-mid transition-colors">
              +
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MightLike;
