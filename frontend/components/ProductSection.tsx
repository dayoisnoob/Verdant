import Link from "next/link";
import ProductCard from "./ProductCard";
import { ProductCard as ProductCardType, ProductSectionProps } from "@/types";

const ProductSection = ({
  label,
  title,
  description,
  products,
}: ProductSectionProps) => {
  return (
    <div className="bg-white/80 rounded-2xl mx-4 px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
        <div>
          <p className="text-[0.65rem] tracking-[0.15em] uppercase text-green mb-2">
            {label}
          </p>
          <h2 className="font-playfair font-black text-verdant-dark text-3xl sm:text-4xl">
            {title}
          </h2>
          <p className="text-verdant-muted text-sm mt-2 max-w-sm">
            {description || ""}
          </p>
        </div>
        <Link
          href="/shop"
          className="text-green text-sm font-medium hover:opacity-65 transition-opacity self-start sm:self-auto"
        >
          Browse all produce →
        </Link>
      </div>

      {products ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p: ProductCardType) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-verdant-muted text-sm">
          No featured products right now.{" "}
          <Link href="/shop" className="text-green font-medium hover:underline">
            Browse everything →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
