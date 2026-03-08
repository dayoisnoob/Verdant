import { useWishlistToggle } from "@/hooks";
import { useCartStore } from "@/store/store";
import { WishlistApi } from "@/types";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const WishlistCard = ({ p }: { p: WishlistApi }) => {
  const { wishlisted, toggle, loading } = useWishlistToggle(p.id, true);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async (p: WishlistApi) => {
    if (!p) return;
    addItem(p);
    toast.success("added to cart");
  };

  return (
    <div className="relative bg-white rounded-2xl border border-green/10 overflow-hidden group hover:border-green/20 hover:shadow-sm transition-all duration-200">
      <Link href={`/product/${p.slug}`}>
        <div className="relative h-44 overflow-hidden">
          <Image
            src={p.images[0].url}
            alt={p.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {p.isOrganic && (
            <span className="absolute top-3 left-3 text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
              Organic
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={toggle}
        disabled={loading}
        className={`absolute top-3 right-3 w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm disabled:opacity-50 ${
          wishlisted
            ? "text-orange-400 hover:bg-orange"
            : "bg-white/90 text-[#ccc] hover:text-orange hover:bg-white"
        }`}
      >
        <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
      </button>

      <div className="p-4">
        <div className="text-[0.65rem] text-verdant-muted uppercase tracking-wider mb-0.5">
          {p.farm}
        </div>
        <div className="font-playfair font-bold text-verdant-dark text-base leading-tight">
          {p.name}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-green">£{p.price}</span>
          <button
            onClick={() => handleAddToCart(p)}
            className="w-8 h-8 bg-green rounded-full flex items-center justify-center text-white text-xl hover:bg-green-mid transition-colors hover:shadow-[0_4px_12px_rgba(45,106,79,0.3)]"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
