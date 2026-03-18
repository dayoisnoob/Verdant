"use client";

import BlurImage from "@/components/BlurImage";
import { useWishlistToggle } from "@/hooks";
import { MAX_CART_LIMIT } from "@/lib/constants";
import { StoreCartItem } from "@/types/cart.types";
import { Loader2, Minus, Plus, Sprout, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RemoveDialog } from "./RemoveDialog";

export default function CartItems({
  items,
  handleUpdateQuantity,
  handleRemoveItem,
}: {
  items: StoreCartItem[];
  handleUpdateQuantity: (id: string, delta: number) => void;
  handleRemoveItem: (itemId: string) => void;
}) {
  const [pendingRemove, setPendingRemove] = useState<{
    productId: string;
    name: string;
  } | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Wrapper function to handle the loading state
  const handleQuantityChange = async (productId: string, delta: number) => {
    setUpdatingId(productId);
    try {
      await handleUpdateQuantity(productId, delta);
    } finally {
      setUpdatingId(null);
    }
  };

  // console.log(items);

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        {items.map((p) => {
          const isThisItemUpdating = updatingId === p.productId;

          return (
            <div
              key={p.slug}
              className="w-full bg-white/80 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-200 p-4 sm:p-5 flex gap-4 sm:gap-6 relative group"
            >
              <Link
                href={`/product/${p.slug}`}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 block"
              >
                <BlurImage
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="120px"
                />
              </Link>

              <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 truncate">
                      {p.farm}
                    </p>
                    <Link
                      href={`/product/${p.slug}`}
                      className="block truncate"
                    >
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
                  {/* ── Active Cart Stepper ── */}
                  <div className="flex items-center justify-between border-2 border-green bg-green/5 rounded-xl overflow-hidden h-10 w-28 sm:w-32 flex-shrink-0 transition-colors">
                    <button
                      disabled={p.quantity <= 1 || isThisItemUpdating}
                      onClick={() => handleQuantityChange(p.productId, -1)}
                      className="w-10 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>

                    <div className="w-8 text-center text-sm font-bold text-verdant-dark flex justify-center items-center">
                      {isThisItemUpdating ? (
                        <Loader2
                          size={14}
                          strokeWidth={3}
                          className="animate-spin text-green"
                        />
                      ) : (
                        Math.min(p.quantity, p.stock)
                      )}
                    </div>

                    <button
                      disabled={
                        p.quantity >= p.stock ||
                        p.quantity >= MAX_CART_LIMIT ||
                        isThisItemUpdating
                      }
                      onClick={() => handleQuantityChange(p.productId, 1)}
                      className="w-10 h-full flex items-center justify-center text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          );
        })}
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
