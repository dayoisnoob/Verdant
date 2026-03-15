import { CartItems as Items } from "@/types";
import { RemoveDialog } from "./RemoveDialog";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistToggle } from "@/hooks";
import { X } from "lucide-react";

export default function CartItems({
  items,
  handleUpdateQuantity,
  handleRemoveItem,
}: {
  items: Items[];
  handleUpdateQuantity: (
    productId: string,
    delta: number,
    current: number,
  ) => void;
  handleRemoveItem: (itemId: string) => void;
}) {
  const [pendingRemove, setPendingRemove] = useState<{
    productId: string;
    name: string;
  } | null>(null);

  const { toggle } = useWishlistToggle(pendingRemove?.productId ?? "");

  function confirmRemove(productId: string, name: string) {
    setPendingRemove({ productId, name });
  }

  function handleConfirmRemove() {
    if (!pendingRemove) return;
    handleRemoveItem(pendingRemove.productId);
    setPendingRemove(null);
  }

  function handleSaveToWishlist(e: React.MouseEvent) {
    if (!pendingRemove) return;

    toggle(e);
    handleRemoveItem(pendingRemove.productId);
    setPendingRemove(null);
  }

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        {items.map((p) => (
          <div
            key={p.slug}
            className="w-full bg-white rounded-2xl border border-green/10 hover:border-green/20 hover:shadow-sm transition-all duration-200 overflow-hidden"
          >
            <div className="p-4 md:p-5 flex gap-4 items-start w-full">
              {/* Thumbnail */}
              <Link
                href={`/product/${p.slug}`}
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Main info */}
              <div className="flex-1 min-w-0 w-full">
                <p className="text-[0.65rem] text-verdant-muted uppercase tracking-wider mb-0.5 hidden sm:block">
                  {p.farm}
                </p>
                <Link href={`/product/${p.slug}`}>
                  <p className="font-playfair font-bold text-verdant-dark text-base md:text-[1.05rem] leading-snug hover:text-green transition-colors">
                    {p.name}
                  </p>
                </Link>
                <p className="text-xs text-verdant-muted mt-0.5">{p.unit}</p>

                {p.isOrganic && (
                  <span className="hidden sm:inline-flex mt-2 text-[0.58rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
                    Organic
                  </span>
                )}

                {/* Bottom row: quantity + price */}
                <div className="flex items-center justify-between mt-3 gap-3 w-full">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-full border border-[#e5e5e5] overflow-hidden w-fit flex-shrink-0">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(p.productId, -1, p.quantity)
                      }
                      className="w-8 h-8 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base font-medium"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-verdant-dark">
                      {p.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(p.productId, 1, p.quantity)
                      }
                      className="w-8 h-8 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base font-medium"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-verdant-dark text-base">
                      £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                    </p>
                    {p.quantity > 1 && (
                      <p className="text-[0.68rem] text-[#bbb]">
                        £{(p.pricePence / 100).toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove — now triggers dialog */}
              <button
                onClick={() => confirmRemove(p.productId, p.name)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#ccc] hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                aria-label="Remove item"
              >
                <X size={14} color="red" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog — rendered outside the list so it overlays everything */}
      {pendingRemove && (
        <RemoveDialog
          product={pendingRemove}
          onClose={() => setPendingRemove(null)}
          onRemove={handleConfirmRemove}
          onWishlist={handleSaveToWishlist}
        />
      )}
    </>
  );
}
