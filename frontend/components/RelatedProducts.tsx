import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { getRelated } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";

const RelatedProducts = ({
  slug,
  product,
}: {
  slug: string;
  product: Product;
}) => {
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", slug],
    queryFn: () => getRelated(slug),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="border-t border-gray-200 px-6 sm:px-10 lg:px-16 xl:px-20 py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-3">
            You might also like
          </p>
          <h2 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl">
            More {product.category}
          </h2>
        </div>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="text-sm font-bold uppercase tracking-widest text-green hover:text-green-mid transition-colors flex items-center gap-2"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>

      {/* ── 🚨 FIX: Hides the scrollbar but keeps it swipable, added native app snapping! ── */}
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
        {relatedProducts?.map((p) => (
          <div key={p.slug} className="min-w-[280px] sm:min-w-0 snap-center">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
