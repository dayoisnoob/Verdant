"use client";

import AddressesTab from "@/components/AddressTab";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";
import SettingsTab from "@/components/SettingsTab";
import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";
import { getUserAddresses, getUserOrders } from "@/lib/api";
import { convertDate } from "@/lib/helpers";
import { useAuthStore } from "@/store/store";
import { FilterStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingBag,
  SquareChartGantt,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ── Types & Constants ──────────────────────────────────────────────────────
export type OrderStatus = "delivered" | "shipped" | "paid" | "processing";

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; bg: string; text: string; pulse?: boolean }
> = {
  delivered: {
    label: "Delivered",
    dot: "bg-green",
    bg: "bg-green/10",
    text: "text-green",
  },
  shipped: {
    label: "On the way",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-600",
    pulse: true,
  },
  paid: {
    label: "Paid",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  processing: {
    label: "Processing",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    pulse: true,
  },
};

type Tab = "overview" | "orders" | "saved" | "addresses" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <SquareChartGantt size={18} strokeWidth={2.5} />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <Package size={18} strokeWidth={2.5} />,
  },
  {
    id: "saved",
    label: "Saved Items",
    icon: <Heart size={18} strokeWidth={2.5} />,
  },
  {
    id: "addresses",
    label: "Addresses",
    icon: <MapPin size={18} strokeWidth={2.5} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={18} strokeWidth={2.5} />,
  },
];

const ORDER_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "On the Way" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState<FilterStatus>("all");

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { wishlist, wishlistError, refetchWishlist } = useWishlist();
  const {
    data: orderData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getUserOrders(),
  });

  const {
    data: addresses = [],
    isError: addressesError,
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => getUserAddresses(),
  });

  if (!user) return null;

  const orders = orderData?.orders || [];

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((o) => o.status === orderFilter);

  const orderCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  if (ordersLoading || addressesLoading) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading your profile...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (ordersError || addressesError || wishlistError) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <ErrorState
            message="Check your connection and try again."
            onRetry={() => {
              refetchOrders();
              refetchAddresses();
              refetchWishlist();
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const initials = user.firstName[0] + (user.lastName?.[0] ?? "");
  const defaultAddress = addresses.find((a) => a.isDefault);
  const totalSpent = (
    orders.reduce((acc, o) => acc + o.totalCents, 0) / 100
  ).toFixed(2);

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-8">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-32 gap-6">
              <div className="bg-verdant-dark rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-green flex items-center justify-center text-white font-playfair font-black text-2xl">
                      {initials}
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2
                          size={16}
                          className="text-green"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-400 text-xs font-medium truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="font-playfair font-black text-white text-2xl leading-none mb-1.5">
                      {orders.length}
                    </p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Orders
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="font-playfair font-black text-green-light text-2xl leading-none truncate mb-1.5">
                      £{totalSpent}
                    </p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Spent
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl py-3 text-center border border-white/10">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Member since {convertDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <nav className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-2 gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-bold transition-all rounded-xl ${
                      tab === t.id
                        ? "bg-green/10 text-green"
                        : "text-gray-500 hover:bg-gray-50 hover:text-verdant-dark"
                    }`}
                  >
                    <span
                      className={tab === t.id ? "text-green" : "text-gray-400"}
                    >
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={logout}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-100 w-full"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Sign Out Securely
              </button>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col w-full">
              <div className="lg:hidden flex flex-col gap-6 mb-8 w-full">
                <div className="bg-verdant-dark rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-green flex items-center justify-center text-white font-playfair font-black text-3xl">
                        {initials}
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle2
                            size={18}
                            className="text-green"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xl truncate mb-1">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-gray-400 text-xs font-medium truncate mb-3">
                        {user.email}
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                          {orders.length} Orders
                        </span>
                        <span className="bg-green/20 text-green-light text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-green/20">
                          £{totalSpent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border-2 ${
                        tab === t.id
                          ? "bg-green border-green text-white shadow-sm"
                          : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-verdant-dark"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Page Title ── */}
              <div className="mb-8">
                <h1 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl">
                  {activeTab?.label}
                </h1>
                {tab === "overview" && (
                  <p className="text-gray-500 font-medium text-sm mt-2">
                    Here&apos;s a quick summary of your account activity.
                  </p>
                )}
              </div>

              {tab === "overview" && (
                <div className="flex flex-col gap-8 w-full">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-6 hover:border-green/30 transition-colors">
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Package
                          className="w-6 h-6 text-gray-400"
                          strokeWidth={2}
                        />
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
                        <CreditCard
                          className="w-6 h-6 text-green"
                          strokeWidth={2}
                        />
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

                  {/* Latest Order */}
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
                      (() => {
                        const order = orders[0];
                        const cfg = STATUS_CONFIG[
                          order.status as OrderStatus
                        ] || {
                          label: order.status,
                          bg: "bg-gray-100",
                          dot: "bg-gray-400",
                          text: "text-gray-600",
                          pulse: false,
                        };

                        return (
                          <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                              <div>
                                <p className="font-mono text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                                  Order #{order.orderNumber}
                                </p>
                                <p className="text-sm font-bold text-verdant-dark">
                                  {convertDate(order.createdAt)}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-transparent w-fit ${cfg.bg}`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
                                />
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-3 mb-6 overflow-x-auto custom-scrollbar pb-2">
                              {order.items.slice(0, 4).map((p) => (
                                <div
                                  key={p.id}
                                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50"
                                >
                                  {p.image ? (
                                    <Image
                                      src={p.image}
                                      alt={p.productName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Package
                                      className="w-full h-full p-4 text-gray-300"
                                      strokeWidth={1}
                                    />
                                  )}
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-gray-500">
                                    +{order.items.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-end justify-between pt-5 border-t border-gray-100">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {order.items.length} Item
                                {order.items.length !== 1 ? "s" : ""}
                              </span>
                              <span className="font-playfair font-black text-verdant-dark text-2xl leading-none">
                                £{(order.totalCents / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Getting Started Checklist */}
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
                            icon: (
                              <CheckCircle2
                                className="w-5 h-5"
                                strokeWidth={2.5}
                              />
                            ),
                            label: "Create your account",
                            desc: "Welcome to Verdant.",
                            action: undefined,
                          },
                          {
                            done: !!defaultAddress,
                            icon: (
                              <MapPin className="w-5 h-5" strokeWidth={2.5} />
                            ),
                            label: "Add a delivery address",
                            desc: "Make checkout faster.",
                            action: () => setTab("addresses"),
                          },
                          {
                            done: orders.length > 0,
                            icon: (
                              <ShoppingBag
                                className="w-5 h-5"
                                strokeWidth={2.5}
                              />
                            ),
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

                  {/* Default Address */}
                  {orders.length > 0 && (
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
                            <MapPin
                              className="w-6 h-6 text-gray-300"
                              strokeWidth={2}
                            />
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
                            <MapPin
                              size={20}
                              className="text-gray-400"
                              strokeWidth={2}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-bold text-verdant-dark mb-1">
                              {defaultAddress.firstName}{" "}
                              {defaultAddress.lastName}
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
                  )}
                </div>
              )}

              {tab === "orders" && (
                <div className="flex flex-col gap-6 w-full">
                  {orders.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
                      {ORDER_FILTERS.map((f) => {
                        const count =
                          f.id === "all"
                            ? orders.length
                            : (orderCounts[f.id] ?? 0);
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
                  ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                        <Search
                          className="w-8 h-8 text-gray-400"
                          strokeWidth={2}
                        />
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
              )}

              {tab === "saved" && <Wishlist items={wishlist} />}

              {tab === "addresses" && <AddressesTab />}

              {tab === "settings" && <SettingsTab user={user} />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
