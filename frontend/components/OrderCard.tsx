"use client";

import { getOrderById } from "@/lib/api";
import { ORDER_PREVIEW_LIMIT, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { convertDate } from "@/lib/helpers";
import { Order } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Package,
  ReceiptText,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BlurImage from "./BlurImage";

export function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const status = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    dot: "bg-gray-400",
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["order", order.id],
    queryFn: () => getOrderById(order.id),
    enabled: expanded,
  });

  const expandedItems = orderDetails?.items ?? [];
  const details = orderDetails ?? null;

  const previewItems = order.items.slice(0, ORDER_PREVIEW_LIMIT);
  const overflow = order.items.length - ORDER_PREVIEW_LIMIT;

  return (
    <div className="bg-white/85 rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden hover:border-gray-200 transition-all duration-300">
      <div
        onClick={() => setExpanded((p) => !p)}
        className="px-6 py-6 sm:px-8 sm:py-8 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-gray-100 text-verdant-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md">
              Order #{order.orderNumber}
            </span>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {convertDate(order.createdAt)}
            </span>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent ${status.bg}`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot} ${
                  status.pulse ? "animate-pulse" : ""
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${status.text}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              {previewItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden bg-white border-2 border-gray-100 flex-shrink-0 flex items-center justify-center ring-4 ring-white ${
                    idx > 0 ? "-ml-4" : ""
                  } z-${10 - idx}`}
                >
                  {item.image ? (
                    <BlurImage
                      src={item.image}
                      alt={item.productName ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package
                      className="w-5 h-5 text-gray-300"
                      strokeWidth={2}
                    />
                  )}
                </div>
              ))}
              {overflow > 0 && (
                <div className="relative w-14 h-14 rounded-xl bg-green/10 text-green border-2 border-green/20 flex items-center justify-center -ml-4 ring-4 ring-white flex-shrink-0 z-0">
                  <span className="text-xs font-bold">+{overflow}</span>
                </div>
              )}
            </div>

            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-end gap-4 md:gap-6 flex-shrink-0">
          <span className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl">
            £{(order.totalPence / 100).toFixed(2)}
          </span>
          <button
            className="w-12 h-12 rounded-xl bg-white border-2 border-green-700 flex items-center justify-center text-gray-400 group-hover:bg-green group-hover:text-white group-hover:border-green transition-all duration-200"
            aria-label={expanded ? "Collapse" : "View details"}
          >
            <ChevronDown
              size={20}
              strokeWidth={2.5}
              className={`transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t-2 border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white/85">
              <Loader2 className="w-8 h-8 text-green animate-spin" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Fetching details...
              </span>
            </div>
          ) : details ? (
            <>
              {/* Items List */}
              <div className="px-6 py-6 sm:px-8 sm:py-8 bg-white">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Items Ordered
                </p>
                <div className="flex flex-col divide-y divide-gray-100">
                  {expandedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white border-2 border-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <BlurImage
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package
                            className="w-6 h-6 text-gray-300"
                            strokeWidth={2}
                          />
                        )}
                        <span className="absolute top-0 right-0 w-6 h-6 bg-verdant-dark text-white text-[10px] font-bold rounded-bl-xl flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-verdant-dark truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                          £{(item.unitPricePence / 100).toFixed(2)} each
                        </p>
                      </div>
                      <p className="text-lg font-black text-verdant-dark flex-shrink-0">
                        £{(item.totalPricePence / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Footer */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-gray-100">
                {/* Address Column */}
                <div className="px-6 py-8 sm:px-8 bg-white md:border-r-2 border-b-2 md:border-b-0 border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <MapPin size={16} strokeWidth={2.5} /> Delivery Address
                  </div>
                  {details.shippingAddress ? (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <p className="text-sm font-bold text-verdant-dark">
                        {details.shippingAddress.firstName}{" "}
                        {details.shippingAddress.lastName}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {details.shippingAddress.streetAddress}
                      </p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                        {details.shippingAddress.state}
                      </p>
                      <div className="flex flex-col gap-1 mt-3">
                        <p className="text-[11px] font-bold text-verdant-dark tracking-widest">
                          {details.shippingAddress.phone1}
                        </p>
                        {details.shippingAddress.phone2 && (
                          <p className="text-[11px] font-bold text-verdant-dark tracking-widest">
                            {details.shippingAddress.phone2}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic mt-1">
                      No address on record
                    </p>
                  )}
                </div>

                {/* Notes Column */}
                <div className="px-6 py-8 sm:px-8 bg-white md:border-r-2 border-b-2 md:border-b-0 border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <StickyNote size={16} strokeWidth={2.5} /> Delivery Notes
                  </div>
                  {details.deliveryNotes ? (
                    <p className="text-sm font-medium text-gray-600 leading-relaxed mt-1">
                      {details.deliveryNotes}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic mt-1">
                      No notes provided
                    </p>
                  )}
                </div>

                {/* High-Contrast Summary Column */}
                <div className="px-6 py-8 sm:px-8 bg-verdant-dark flex flex-col gap-4 text-white">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <ReceiptText size={16} strokeWidth={2.5} /> Summary
                  </div>
                  <div className="flex flex-col gap-3 mt-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-400">Subtotal</span>
                      <span className="font-bold text-white">
                        £{Number(details.subtotalPence / 100).toFixed(2)}
                      </span>
                    </div>
                    {details.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-green">Discount</span>
                        <span className="font-bold text-green">
                          −£{Number(details.discountAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-400">Delivery</span>
                      <span className="font-bold text-white">
                        {details.shippingFee <= 0 ? (
                          <span className="text-green uppercase tracking-widest text-[10px]">
                            Free
                          </span>
                        ) : (
                          `£${Number(details.shippingFee / 100).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-3" />
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Total
                      </span>
                      <span className="font-playfair font-black text-green text-3xl leading-none">
                        £{Number(details.totalPence / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
