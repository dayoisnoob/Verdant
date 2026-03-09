"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/api";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AllOrders } from "@/types";
import { ORDER_PREVIEW_LIMIT, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { convertDate } from "@/lib/api/helpers";

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
    queryFn: async () => {
      const res = await getOrderById(order.id);
      return res.data;
    },
    enabled: expanded,
  });

  const expandedItems = orderDetails?.items ?? [];
  const details = orderDetails?.order ?? null;

  const previewItems = order.items.slice(0, ORDER_PREVIEW_LIMIT);
  const overflow = order.items.length - ORDER_PREVIEW_LIMIT;

  return (
    <div className="bg-white rounded-2xl border border-green/10 overflow-hidden hover:border-green/20 hover:shadow-sm transition-all duration-200">
      {/* ── Always-visible header ── */}
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-4">
          {/* Left — order info */}
          <div className="flex-1 min-w-0">
            {/* Order number + status badge */}
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <span className="font-mono text-xs text-verdant-muted tracking-tight">
                {order.orderNumber}
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot} ${
                    status.pulse ? "animate-pulse" : ""
                  }`}
                />
                <span
                  className={`text-[0.62rem] font-bold uppercase tracking-wider ${status.text}`}
                >
                  {status.label}
                </span>
              </div>
            </div>

            {/* Total + date */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-playfair font-bold text-verdant-dark text-lg">
                £{Number(order.totalCents / 100).toFixed(2)}
              </span>
              <span className="text-xs text-verdant-muted">
                {convertDate(order.createdAt)}
              </span>
            </div>

            {/* Thumbnail strip — always visible */}
            <div className="flex items-center gap-2">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-green-pale flex-shrink-0 border border-green/8"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      🥦
                    </div>
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green text-white text-[0.5rem] font-black rounded-full flex items-center justify-center leading-none">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {overflow > 0 && (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-pale border border-green/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[0.62rem] font-bold text-green">
                    +{overflow}
                  </span>
                </div>
              )}
              <span className="text-xs text-verdant-muted ml-1">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Right — expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-9 h-9 rounded-full border border-green/15 flex items-center justify-center text-verdant-muted hover:border-green hover:text-green hover:bg-green-pale transition-all duration-200 flex-shrink-0 mt-0.5"
            aria-label={expanded ? "Collapse" : "View details"}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── Expanded section ── */}
      {expanded && (
        <div className="border-t border-[#f0f0f0]">
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 rounded-full border-2 border-green-pale" />
                <div className="absolute inset-0 rounded-full border-2 border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <span className="text-xs text-verdant-muted">
                Loading details…
              </span>
            </div>
          )}

          {details && (
            <>
              {/* Items */}
              <div className="px-6 py-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-verdant-muted mb-4">
                  Items Ordered
                </p>
                <div className="flex flex-col gap-3">
                  {expandedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-green-pale border border-green/8">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🥦
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green text-white text-[0.55rem] font-black rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-verdant-dark truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-verdant-muted mt-0.5">
                          £{(parseFloat(item.unitPriceCents) / 100).toFixed(2)}{" "}
                          each
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-verdant-dark flex-shrink-0">
                        £{(parseFloat(item.totalPriceCents) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#f0f0f0]">
                <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-verdant-muted mb-3">
                    Delivery Address
                  </p>
                  {details.shippingAddress ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-verdant-dark">
                        {details.shippingAddress.streetAddress}
                      </p>
                      <p className="text-xs text-verdant-muted">
                        {details.shippingAddress.state}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1.5">
                        <p className="text-xs text-[#bbb]">
                          📞 +234 {details.shippingAddress.phone1}
                        </p>
                        {details.shippingAddress.phone2 && (
                          <p className="text-xs text-[#bbb]">
                            📞 +234 {details.shippingAddress.phone2}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#bbb] italic">
                      No address on record
                    </p>
                  )}
                </div>

                <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-verdant-muted mb-3">
                    Delivery Notes
                  </p>
                  {details.deliveryNotes ? (
                    <p className="text-sm text-verdant-dark leading-relaxed">
                      {details.deliveryNotes}
                    </p>
                  ) : (
                    <p className="text-xs text-[#bbb] italic">None provided</p>
                  )}
                </div>

                <div className="px-6 py-5">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-verdant-muted mb-3">
                    Summary
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-verdant-muted">Subtotal</span>
                      <span className="font-medium text-verdant-dark">
                        £{Number(details.subtotalCents / 100).toFixed(2)}
                      </span>
                    </div>
                    {details.discountAmount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green">Discount</span>
                        <span className="text-green font-medium">
                          −£{Number(details.discountAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-verdant-muted">Delivery</span>
                      <span className="font-medium text-verdant-dark">
                        {details.shippingFee <= 0 ? (
                          <span className="text-green">Free</span>
                        ) : (
                          `£${Number(details.shippingFee / 100).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="h-px bg-[#f0f0f0] my-1" />
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-verdant-dark">
                        Total
                      </span>
                      <span className="font-playfair font-bold text-green text-base">
                        £{Number(details.totalCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
