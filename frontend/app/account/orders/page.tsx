"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";
import { getuserOrders } from "@/lib/api";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import { FilterStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "On the Way" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getuserOrders();
      return res.data;
    },
  });

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <main className="pt-24 bg-cream min-h-screen pb-16">
        {/* ── Page header ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-10 border-b border-green/10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
                Your Account
              </p>
              <h1 className="font-playfair font-black text-verdant-dark text-4xl md:text-5xl">
                My Orders
              </h1>
              <p className="text-verdant-muted mt-2 text-sm">
                {isLoading
                  ? "Loading your orders…"
                  : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
              </p>
            </div>

            {/* Quick stats — only when data is loaded */}
            {!isLoading && orders.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {(["shipped", "delivered"] as const).map((s) => {
                  if (!counts[s]) return null;
                  const cfg = ORDER_STATUS_CONFIG[s];
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${cfg.bg} border-transparent`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
                      />
                      <span className={`text-xs font-semibold ${cfg.text}`}>
                        {counts[s]} {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {!isLoading && orders.length > 0 && (
            <div className="flex items-center gap-1.5 mt-7 flex-wrap">
              {FILTERS.map((f) => {
                const count =
                  f.id === "all" ? orders.length : (counts[f.id] ?? 0);
                if (f.id !== "all" && count === 0) return null;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      filter === f.id
                        ? "bg-green text-white shadow-sm"
                        : "text-verdant-muted hover:text-green hover:bg-green-pale"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                        filter === f.id
                          ? "bg-white/20 text-white"
                          : "bg-[#e8e8e8] text-verdant-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-10">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-[3px] border-green-pale" />
                <div className="absolute inset-0 rounded-full border-[3px] border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className="text-sm text-verdant-muted">
                Fetching your orders…
              </p>
            </div>
          )}

          {/* Empty state — no orders at all */}
          {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 bg-green-pale rounded-2xl flex items-center justify-center mb-6">
                <Package className="text-green w-9 h-9" />
              </div>
              <h2 className="font-playfair font-bold text-verdant-dark text-2xl mb-3">
                No orders yet
              </h2>
              <p className="text-verdant-muted text-sm max-w-xs mb-8 leading-relaxed">
                You haven&apos;t placed any orders yet. Browse our fresh produce
                and start your first order today.
              </p>
              <Link
                href="/shop"
                className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
              >
                Browse Produce →
              </Link>
            </div>
          )}

          {/* Empty state — filter has no results */}
          {!isLoading && orders.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-verdant-dark font-semibold mb-1">
                No {filter} orders
              </p>
              <p className="text-sm text-verdant-muted">
                Try a different filter or{" "}
                <button
                  onClick={() => setFilter("all")}
                  className="text-green hover:underline font-medium"
                >
                  view all orders
                </button>
              </p>
            </div>
          )}

          {/* Orders list */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex flex-col gap-4 max-w-3xl">
              {filtered.map((order) => (
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
