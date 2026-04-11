"use client";

import BlurImage from "@/components/BlurImage";
import { ProductCard } from "@/types";
import Link from "next/link";

function MightLikeCard({ product }: { product: ProductCard }) {
  console.log(product);
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 overflow-hidden h-full"
    >
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden border-b-2 border-gray-100">
        <BlurImage
          src={product.images[0]?.url}
          alt={product.images[0]?.alt || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {product.isOrganic && (
          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-green text-white px-2 py-1 rounded-md shadow-sm z-10">
            Organic
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1">
        <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
          {product.farm}
        </div>

        <h3 className="font-playfair font-bold text-verdant-dark text-sm sm:text-base leading-snug group-hover:text-green transition-colors truncate">
          {product.name}
        </h3>

        <div className="flex-1" />

        <div className="font-bold text-verdant-dark text-sm sm:text-base mt-1">
          £{(product.price / 100).toFixed(2)}
        </div>
      </div>
    </Link>
  );
}

const MightLike = ({ suggested }: { suggested: ProductCard[] }) => {
  if (!suggested || suggested.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8">
        <h2 className="font-playfair font-black text-verdant-dark text-2xl md:text-3xl tracking-tight">
          You might also like
        </h2>
      </div>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
        {suggested.map((p) => (
          <div key={p.slug} className="min-w-[160px] sm:min-w-0 snap-center">
            <MightLikeCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MightLike;
