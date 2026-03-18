"use client";

import { OrderCard } from "@/components/OrderCard";
import { ORDER_FILTERS } from "@/lib/constants";
import { FilterStatus } from "@/types";
import { Order } from "@/types/order.types";
import { ArrowRight, Package, Search } from "lucide-react";
import Link from "next/link";

interface OrdersTabProps {
  orders: Order[];
  filteredOrders: Order[];
  orderCounts: Record<string, number>;
  orderFilter: FilterStatus;
  setOrderFilter: (filter: FilterStatus) => void;
}

export default function OrdersTab({
  orders,
  filteredOrders,
  orderCounts,
  orderFilter,
  setOrderFilter,
}: OrdersTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
          {ORDER_FILTERS.map((f) => {
            const count =
              f.id === "all" ? orders.length : (orderCounts[f.id] ?? 0);
            if (f.id !== "all" && count === 0) return null;
            return (
              <button
                key={f.id}
                onClick={() => setOrderFilter(f.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 whitespace-nowrap transition-colors duration-200 ${
                  orderFilter === f.id
                    ? "bg-green border-green text-white shadow-sm"
                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-verdant-dark"
                }`}
              >
                {f.label}
                <span
                  className={`text-[10px] w-5 h-5 rounded-md flex items-center justify-center ${
                    orderFilter === f.id
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

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <Package className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-playfair font-bold text-verdant-dark text-3xl mb-3">
            No orders yet
          </h2>
          <p className="text-gray-500 font-medium text-sm max-w-sm mb-8 leading-relaxed">
            You haven&apos;t placed any orders yet. Browse our fresh produce and
            start your first order today.
          </p>
          <Link
            href="/shop"
            className="bg-green text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-mid transition-colors flex items-center gap-2 shadow-sm"
          >
            Browse Produce <ArrowRight size={18} />
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <Search className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>
          <p className="font-playfair font-bold text-verdant-dark text-2xl mb-2">
            No {orderFilter} orders
          </p>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            Try a different filter or{" "}
            <button
              onClick={() => setOrderFilter("all")}
              className="text-green font-bold hover:text-green-mid transition-colors uppercase tracking-wider text-xs ml-1"
            >
              view all orders
            </button>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
