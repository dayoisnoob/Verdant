"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";
import { useOrders } from "@/hooks";
import { ORDER_FILTERS, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { FilterStatus } from "@/types";
import { ArrowRight, Loader2, Package, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { orders, filtered, counts, isLoading } = useOrders();

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="py-8 md:py-12 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-green mb-4">
                  Your Account
                </p>
                <h1 className="font-playfair font-black text-verdant-dark text-4xl sm:text-5xl tracking-tight mb-3">
                  My Orders
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  {isLoading
                    ? "Loading your orders..."
                    : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
                </p>
              </div>

              {!isLoading && orders.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {(["shipped", "delivered"] as const).map((s) => {
                    if (!counts[s]) return null;
                    const cfg = ORDER_STATUS_CONFIG[s];
                    return (
                      <div
                        key={s}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${cfg.bg} border-transparent`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${cfg.dot} ${
                            cfg.pulse ? "animate-pulse" : ""
                          }`}
                        />
                        <span
                          className={`text-[11px] font-bold uppercase tracking-widest ${cfg.text}`}
                        >
                          {counts[s]} {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!isLoading && orders.length > 0 && (
              <div className="flex items-center gap-2 mt-8 overflow-x-auto custom-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
                {ORDER_FILTERS.map((f) => {
                  const count =
                    f.id === "all" ? orders.length : (counts[f.id] ?? 0);
                  if (f.id !== "all" && count === 0) return null;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 whitespace-nowrap transition-colors duration-200 ${
                        filter === f.id
                          ? "bg-green border-green text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-verdant-dark"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`text-[10px] w-5 h-5 rounded-md flex items-center justify-center ${
                          filter === f.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
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

          <div className="pt-10">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-green animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Fetching your orders...
                </p>
              </div>
            )}

            {!isLoading && orders.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <Package
                    className="w-10 h-10 text-gray-400"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="font-playfair font-bold text-verdant-dark text-3xl mb-3">
                  No orders yet
                </h2>
                <p className="text-gray-500 font-medium text-sm max-w-sm mb-8 leading-relaxed">
                  You haven&apos;t placed any orders yet. Browse our fresh
                  produce and start your first order today.
                </p>
                <Link
                  href="/shop"
                  className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-colors flex items-center gap-2 shadow-sm"
                >
                  Browse Produce <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {!isLoading && orders.length > 0 && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <Search className="w-8 h-8 text-gray-400" strokeWidth={2} />
                </div>
                <p className="font-playfair font-bold text-verdant-dark text-2xl mb-2">
                  No {filter} orders
                </p>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  Try a different filter or{" "}
                  <button
                    onClick={() => setFilter("all")}
                    className="text-green font-bold hover:text-green-mid transition-colors uppercase tracking-wider text-xs ml-1"
                  >
                    view all orders
                  </button>
                </p>
              </div>
            )}

            {!isLoading && filtered.length > 0 && (
              <div className="flex flex-col gap-6 w-full">
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
