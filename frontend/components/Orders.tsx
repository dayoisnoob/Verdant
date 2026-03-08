"use client";

import { OrderStatus, StatusConfig } from "@/app/account/profile/page";
import { getOrderById } from "@/lib/api";
import { convertDate } from "@/lib/api/helpers";
import { AllOrders, SingleOrder } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Orders = ({
  orders,
  statusConfig,
}: {
  orders: AllOrders[];
  statusConfig: StatusConfig;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, SingleOrder>>(
    {},
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (orderId: string) => {
    if (openId === orderId) {
      setOpenId(null);
      return;
    }

    setOpenId(orderId);

    if (!orderDetails[orderId]) {
      setLoadingId(orderId);
      try {
        // TODO: replace with your actual fetch
        const data = await getOrderById(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: data.data }));
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <h2 className="font-playfair font-bold text-verdant-dark text-2xl mb-2">
        Order History
      </h2>

      {orders.map((order) => {
        const cfg = statusConfig[order.status as OrderStatus];
        const isOpen = openId === order.id;
        const isLoading = loadingId === order.id;
        const detail = orderDetails[order.id];

        return (
          <div
            key={order.id}
            className={`bg-white rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-green/30 shadow-sm"
                : "border-green/10 hover:border-green/20 hover:shadow-sm"
            }`}
          >
            {/* ── Summary Row ── */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-mono text-xs text-verdant-muted">
                      {order.orderNumber}
                    </span>
                    <div className="font-semibold text-verdant-dark mt-0.5">
                      {convertDate(order.createdAt)}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${
                        order.status === "on-the-way" ? "animate-pulse" : ""
                      }`}
                    />
                    <span className={`text-xs font-semibold ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <span className="font-playfair font-bold text-green text-xl">
                  £{(order.totalCents / 100).toFixed(2)}
                </span>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2.5 mb-4">
                {order.items.slice(0, 4).map((p) => {
                  const slug = p.productName.split(" ").join("-").toLowerCase();
                  return (
                    <Link key={p.id} href={`/product/${slug}`}>
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden hover:ring-2 ring-green transition-all">
                        <Image
                          src={p.image}
                          alt={p.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  );
                })}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 rounded-xl bg-green-pale flex items-center justify-center text-green text-xs font-semibold">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                <span className="text-sm text-verdant-muted">
                  {order.items.length} items
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggle(order.id)}
                    className="text-xs text-verdant-muted hover:text-green font-medium transition-colors flex items-center gap-1"
                  >
                    {isOpen ? "Hide details" : "View details"}
                    <svg
                      viewBox="0 0 12 12"
                      className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        d="M2 4l4 4 4-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* TODO: wire to add all items back to cart */}
                  <button className="text-xs bg-orange-pale text-orange font-semibold px-4 py-1.5 rounded-full hover:bg-orange hover:text-white transition-all">
                    Reorder
                  </button>
                </div>
              </div>
            </div>

            {/* ── Expanded Detail ── */}
            {isOpen && (
              <div className="border-t border-[#f0f0f0] px-6 pb-6 pt-5">
                {isLoading ? (
                  <div className="flex items-center gap-3 py-4 text-sm text-verdant-muted">
                    <div className="w-4 h-4 rounded-full border-2 border-green border-t-transparent animate-spin" />
                    Loading order details...
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {/* Line items */}
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-verdant-dark">
                              {item.productName}
                              <span className="text-verdant-muted ml-1">
                                × {item.quantity}
                              </span>
                            </span>
                          </div>
                          {/* TODO: item.priceCents comes from your fetched detail */}
                          <span className="font-medium text-verdant-dark tabular-nums">
                            {detail
                              ? `£${(Number(item.totalPriceCents) / 100).toFixed(2)}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-[#f0f0f0]">
                      <div className="flex justify-between text-sm">
                        <span className="text-verdant-muted">Subtotal</span>
                        <span className="font-medium">
                          {detail
                            ? `£${(detail.order.subtotalCents / 100).toFixed(2)}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-verdant-muted">Discount</span>
                        <span className="font-medium text-red-600">
                          -
                          {detail
                            ? `£${(detail.order.discountAmount / 100).toFixed(2)}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-verdant-muted">Delivery</span>
                        <span
                          className={`font-medium ${detail?.order.shippingFee === 0 ? "text-green" : ""}`}
                        >
                          {detail
                            ? detail.order.shippingFee === 0
                              ? "Free"
                              : `£${detail.order.shippingFee.toFixed(2)}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-sm pt-1 border-t border-[#f0f0f0]">
                        <span className="text-verdant-dark">Total</span>
                        <span className="text-green font-playfair font-bold text-base">
                          £{(order.totalCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="bg-green-pale/50 rounded-xl p-4">
                        <div className="text-[0.65rem] uppercase tracking-wider text-green font-semibold mb-1">
                          Delivered to
                        </div>
                        <div className="text-sm text-verdant-dark">
                          {detail?.order.shippingAddress.streetAddress ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button className="text-xs bg-orange-pale text-orange font-semibold px-5 py-2 rounded-full hover:bg-orange hover:text-white transition-all">
                        Reorder all items
                      </button>
                      <button className="text-xs border border-[#e5e5e5] text-verdant-muted font-medium px-5 py-2 rounded-full hover:border-green hover:text-green transition-all">
                        Download invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Orders;
