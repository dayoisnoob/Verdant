"use client";

import { getOrderById } from "@/lib/api";
import { ORDER_PREVIEW_LIMIT, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { convertDate } from "@/lib/helpers";
import { AllOrders } from "@/types";
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

export function OrderCard({ order }: { order: AllOrders }) {
  const [expanded, setExpanded] = useState(false);

  const status = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    dot: "bg-gray-400",
    bg: "bg-gray-50",
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-green/30 transition-colors duration-200">
      <div
        onClick={() => setExpanded((p) => !p)}
        className="px-6 py-5 sm:px-8 sm:py-6 cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase">
                Order #{order.orderNumber}
              </span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                {convertDate(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap mb-5">
              <span className="font-playfair font-black text-verdant-dark text-3xl">
                £{Number(order.totalCents / 100).toFixed(2)}
              </span>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-transparent ${status.bg}`}
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

            <div className="flex items-center gap-3 flex-wrap">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Package
                      className="w-6 h-6 text-gray-300"
                      strokeWidth={2}
                    />
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-verdant-dark text-white text-[10px] font-bold rounded-md flex items-center justify-center border-2 border-white">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {overflow > 0 && (
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-500">
                    +{overflow}
                  </span>
                </div>
              )}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <button
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green group-hover:text-white group-hover:border-green transition-all duration-200 flex-shrink-0 mt-1"
            aria-label={expanded ? "Collapse" : "View details"}
          >
            <ChevronDown
              size={18}
              strokeWidth={2.5}
              className={`transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-green animate-spin" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Loading Details...
              </span>
            </div>
          ) : details ? (
            <>
              <div className="px-6 py-6 sm:px-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
                  Items Ordered
                </p>
                <div className="flex flex-col gap-4">
                  {expandedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <Image
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
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-verdant-dark text-white text-[10px] font-bold rounded-md flex items-center justify-center border-2 border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-verdant-dark truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          £{(parseFloat(item.unitPriceCents) / 100).toFixed(2)}{" "}
                          each
                        </p>
                      </div>
                      <p className="text-base font-black text-verdant-dark flex-shrink-0">
                        £{(parseFloat(item.totalPriceCents) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-100 bg-white">
                <div className="px-6 py-6 sm:px-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    <MapPin size={14} /> Delivery Address
                  </div>
                  {details.shippingAddress ? (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-bold text-verdant-dark">
                        {details.shippingAddress.firstName}{" "}
                        {details.shippingAddress.lastName}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {details.shippingAddress.streetAddress}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {details.shippingAddress.state}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-xs font-bold text-gray-400 tracking-wider">
                          {details.shippingAddress.phone1}
                        </p>
                        {details.shippingAddress.phone2 && (
                          <p className="text-xs font-bold text-gray-400 tracking-wider">
                            {details.shippingAddress.phone2}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic">
                      No address on record
                    </p>
                  )}
                </div>

                <div className="px-6 py-6 sm:px-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    <StickyNote size={14} /> Delivery Notes
                  </div>
                  {details.deliveryNotes ? (
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                      {details.deliveryNotes}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic">
                      None provided
                    </p>
                  )}
                </div>

                <div className="px-6 py-6 sm:px-8 flex flex-col gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    <ReceiptText size={14} /> Summary
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">
                        Subtotal
                      </span>
                      <span className="font-bold text-verdant-dark">
                        £{Number(details.subtotalCents / 100).toFixed(2)}
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
                      <span className="font-medium text-gray-500">
                        Delivery
                      </span>
                      <span className="font-bold text-verdant-dark">
                        {details.shippingFee <= 0 ? (
                          <span className="text-green">Free</span>
                        ) : (
                          `£${Number(details.shippingFee / 100).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Total
                      </span>
                      <span className="font-playfair font-black text-green text-2xl leading-none">
                        £{Number(details.totalCents / 100).toFixed(2)}
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
