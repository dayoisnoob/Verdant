"use client";

import { AlertTriangle, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type UnavailableItem = {
  id: string;
  name: string;
  image: string;
  issue: "out_of_stock" | "quantity_changed";
  availableQty?: number;
};

interface UnavailableItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: UnavailableItem[];
  message?: string;
}

export default function UnavailableItemModal({
  isOpen,
  onClose,
  items,
  message,
}: UnavailableItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-verdant-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 flex flex-col items-center text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-verdant-dark hover:bg-white transition-colors shadow-sm"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5 shadow-sm">
            <AlertTriangle
              className="w-8 h-8 text-orange-500"
              strokeWidth={2.5}
            />
          </div>

          <h2 className="font-playfair font-black text-verdant-dark text-2xl mb-2">
            Cart Update Required
          </h2>
          <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[280px]">
            {message ||
              "Some items in your basket are no longer available in the requested quantity."}
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-6 max-h-[240px] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Please review these items
          </p>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50/50 border border-gray-100 rounded-2xl"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-verdant-dark truncate mb-1">
                    {item.name}
                  </p>

                  {item.issue === "out_of_stock" ? (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">
                      Out of stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md border border-orange-100">
                      Only {item.availableQty} left
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gray-50/80 border-t border-gray-100 flex flex-col gap-3">
          <Link
            href="/basket"
            className="w-full bg-verdant-dark text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            Return to Basket
          </Link>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border-2 border-gray-200 hover:border-gray-300 hover:text-verdant-dark transition-colors"
          >
            Cancel Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
