"use client";

import { useWishlistToggle } from "@/hooks";
import { Minus, Plus, Sprout, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RemoveDialog } from "./RemoveDialog";
import { StoreCartItem } from "@/types/cart.types";

export default function CartItems({
  items,
  handleUpdateQuantity,
  handleRemoveItem,
}: {
  items: StoreCartItem[];
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
      <div className="flex flex-col gap-4 w-full">
        {items.map((p) => (
          <div
            key={p.slug}
            className="w-full bg-white/80 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-200 p-4 sm:p-5 flex gap-4 sm:gap-6 relative group"
          >
            <Link
              href={`/product/${p.slug}`}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50"
            >
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 truncate">
                    {p.farm}
                  </p>
                  <Link href={`/product/${p.slug}`} className="block truncate">
                    <p className="font-playfair font-bold text-verdant-dark text-lg sm:text-xl leading-tight hover:text-green transition-colors truncate">
                      {p.name}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      {p.unit}
                    </p>
                    {p.isOrganic && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2.5 py-1 rounded-md">
                        <Sprout size={12} strokeWidth={2.5} /> Organic
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => confirmRemove(p.productId, p.name)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 -mt-1 -mr-1"
                  aria-label="Remove item"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex items-end justify-between mt-4">
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(p.productId, -1, p.quantity)
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-verdant-dark hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-verdant-dark">
                    {p.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(p.productId, 1, p.quantity)
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-verdant-dark hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-playfair font-black text-verdant-dark text-xl sm:text-2xl leading-none">
                    £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                  </p>
                  {p.quantity > 1 && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      £{(p.pricePence / 100).toFixed(2)} each
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
