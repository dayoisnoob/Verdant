"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { getOrderById, getuserOrders } from "@/lib/api";
import { useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { OrderDetails } from "@/types";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: "🕐",
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: "⚙️",
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700",
    icon: "🚚",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: "❌",
  },
};

// ── Types — replace with your actual types from @/types ───────────────────
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  streetAddress: string;
  state: string;
  phone1: string;
  phone2?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalCents: number;
  subTotalCents: number;
  discountAmount: number;
  deliveryNotes?: string;
  customerEmail?: string;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
}

// ── Order Card ────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  //   const { items, order } = orderDetails;

  const status = STATUS_CONFIG[order.status] ?? {
    label: order?.status,
    color: "bg-gray-100 text-gray-700",
    icon: "📦",
  };

  const date = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["order", order.id],
    queryFn: async () => {
      const res = await getOrderById(order.id);
      return res.data;
    },
    enabled: expanded, // ← only fetches when the card is expanded
  });

  if (isLoading) return null;

  const items = orderDetails?.items ?? [];
  const details = orderDetails?.order ?? null;

  console.log(orderDetails);

  return (
    <div className="bg-white rounded-2xl border border-green/10 overflow-hidden hover:border-green/20 transition-colors duration-200">
      {/* ── Card Header ── */}
      <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Order icon */}
          <div className="w-11 h-11 bg-green-pale rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🧾
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-playfair font-bold text-verdant-dark text-base">
                {order.orderNumber}
              </span>
              <span
                className={`text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.color}`}
              >
                {status.icon} {status.label}
              </span>
            </div>
            <p className="text-xs text-verdant-muted mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-playfair font-bold text-green text-lg">
              {/* £{total.toFixed(2)} */}
            </div>
            <div className="text-xs text-verdant-muted">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-9 h-9 rounded-full border border-green/20 flex items-center justify-center text-verdant-muted hover:border-green hover:text-green hover:bg-green-pale transition-all duration-200 flex-shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {expanded && orderDetails && (
        <div className="border-t border-[#f0f0f0]">
          {/* Items */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-verdant-muted mb-4">
              Items Ordered
            </p>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-green-pale">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🥦
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-verdant-dark truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-verdant-muted mt-0.5">
                      £{Number(item.unitPriceCents / 100).toFixed(2)} each
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-verdant-dark flex-shrink-0">
                    £{Number(item.totalPriceCents / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom grid — shipping + notes + totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#f0f0f0]">
            {/* Shipping address */}
            <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
              <p className="text-xs font-semibold uppercase tracking-wider text-verdant-muted mb-3">
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
                  <div className="flex flex-col gap-0.5 mt-2">
                    <p className="text-xs text-[#aaa]">
                      📞 +234 {details.shippingAddress.phone1}
                    </p>
                    {details.shippingAddress.phone2 && (
                      <p className="text-xs text-[#aaa]">
                        📞 +234 {details.shippingAddress.phone2}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#aaa]">No address on record</p>
              )}
            </div>

            {/* Delivery notes */}
            <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
              <p className="text-xs font-semibold uppercase tracking-wider text-verdant-muted mb-3">
                Delivery Notes
              </p>
              {details.deliveryNotes ? (
                <p className="text-sm text-verdant-dark leading-relaxed">
                  {details.deliveryNotes}
                </p>
              ) : (
                <p className="text-xs text-[#aaa] italic">None provided</p>
              )}
            </div>

            {/* Order totals */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-verdant-muted mb-3">
                Order Summary
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
                      `£${details.shippingFee.toFixed(2)}`
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
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getuserOrders();
      return res.data;
    },
  });

  return (
    <>
      <Navbar />

      <main className="pt-24 bg-cream min-h-screen pb-16">
        {/* Header */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-10 border-b border-green/10">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Your Account
          </p>
          <h1 className="font-playfair font-black text-verdant-dark text-4xl md:text-5xl">
            My Orders
          </h1>
          <p className="text-verdant-muted mt-2 text-sm">
            {isLoading
              ? "Loading your orders..."
              : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>

        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-10">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-green-pale" />
                <div className="absolute inset-0 rounded-full border-4 border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className="text-sm text-verdant-muted">
                Fetching your orders...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center text-4xl mb-6">
                <Package className="text-green w-9 h-9" />
              </div>
              <h2 className="font-playfair font-bold text-verdant-dark text-2xl mb-3">
                No orders yet
              </h2>
              <p className="text-verdant-muted text-sm max-w-sm mb-8">
                You haven&apos;t placed any orders yet. Browse our fresh produce
                and place your first order today.
              </p>
              <Link
                href="/shop"
                className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
              >
                Browse Produce →
              </Link>
            </div>
          )}

          {/* Orders list */}
          {!isLoading && orders.length > 0 && (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
