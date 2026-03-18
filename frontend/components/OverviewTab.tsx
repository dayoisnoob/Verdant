"use client";

import { OrderCard } from "@/components/OrderCard";
import { AddressApi } from "@/types";
import { Order, Tab } from "@/types/order.types";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

interface OverviewTabProps {
  orders: Order[];
  totalSpent: string;
  defaultAddress?: AddressApi;
  setTab: (tab: Tab) => void;
}

export default function OverviewTab({
  orders,
  totalSpent,
  defaultAddress,
  setTab,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-6 hover:border-green/30 transition-colors">
          <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-gray-400" strokeWidth={2} />
          </div>
          <div>
            <p className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl leading-none mb-1">
              {orders.length}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Total Orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-6 hover:border-green/30 transition-colors">
          <div className="w-14 h-14 bg-green/10 border border-green/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-green" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-playfair font-black text-green text-3xl md:text-4xl leading-none mb-1 truncate">
              £{totalSpent}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Total Spent
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-verdant-dark text-base">
            Latest Order
          </h3>
          {orders.length > 0 && (
            <button
              onClick={() => setTab("orders")}
              className="text-xs font-bold text-green uppercase tracking-widest hover:text-green-mid flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag
                className="w-8 h-8 text-gray-300"
                strokeWidth={1.5}
              />
            </div>
            <p className="font-bold text-verdant-dark text-lg mb-2">
              No orders yet
            </p>
            <p className="text-sm font-medium text-gray-500 mb-6">
              Your recent orders will appear here.
            </p>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-widest bg-green text-white px-6 py-3 rounded-xl hover:bg-green-mid transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <OrderCard order={orders[0]} />
          </div>
        )}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-bold text-verdant-dark text-base mb-1">
              Setup Guide
            </h3>
            <p className="text-xs font-medium text-gray-500">
              Complete these steps to get the most out of Verdant.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-gray-50 p-2">
            {[
              {
                done: true,
                icon: <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />,
                label: "Create your account",
                desc: "Welcome to Verdant.",
                action: undefined,
              },
              {
                done: !!defaultAddress,
                icon: <MapPin className="w-5 h-5" strokeWidth={2.5} />,
                label: "Add a delivery address",
                desc: "Make checkout faster.",
                action: () => setTab("addresses"),
              },
              {
                done: orders.length > 0,
                icon: <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />,
                label: "Place your first order",
                desc: "Farm-fresh produce delivered to your door.",
                action: () => (window.location.href = "/shop"),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors rounded-xl"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${
                    item.done
                      ? "bg-green/10 text-green border-green/20"
                      : "bg-gray-50 text-gray-400 border-gray-100"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${item.done ? "text-gray-400 line-through" : "text-verdant-dark"}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                    {item.desc}
                  </p>
                </div>
                {!item.done && item.action && (
                  <button
                    onClick={item.action}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:border-green hover:text-green transition-colors shadow-sm flex-shrink-0"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-verdant-dark text-base">
            Default Address
          </h3>
          {defaultAddress && (
            <button
              onClick={() => setTab("addresses")}
              className="text-xs font-bold text-green uppercase tracking-widest hover:text-green-mid flex items-center gap-1"
            >
              Manage <ChevronRight size={14} />
            </button>
          )}
        </div>

        {!defaultAddress ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-gray-300" strokeWidth={2} />
            </div>
            <p className="font-bold text-verdant-dark text-lg mb-2">
              No address saved
            </p>
            <p className="text-sm font-medium text-gray-500 mb-6">
              Add a delivery address for faster checkout.
            </p>
            <button
              onClick={() => setTab("addresses")}
              className="text-xs font-bold uppercase tracking-widest border-2 border-gray-200 bg-white text-verdant-dark px-6 py-3 rounded-xl hover:border-green hover:text-green transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-gray-400" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-bold text-verdant-dark mb-1">
                {defaultAddress.firstName} {defaultAddress.lastName}
              </p>
              <p className="text-sm font-medium text-gray-600 leading-relaxed mb-2">
                {defaultAddress.streetAddress}
                <br />
                {defaultAddress.state} State
              </p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                +234 {defaultAddress.phone1}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
