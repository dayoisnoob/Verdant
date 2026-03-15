"use client";

import AddressesTab from "@/components/AdressesTab";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";
import SettingsTab from "@/components/SettingsTab";
import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";
import { getUserAddresses, getuserOrders } from "@/lib/api";
import { convertDate } from "@/lib/helpers";
import { useAuthStore } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import {
  CircleCheck,
  CircleCheckBig,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  SquareChartGantt,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type OrderStatus = "delivered" | "shipped" | "paid" | "processing";

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  delivered: {
    label: "Delivered",
    dot: "bg-green",
    bg: "bg-green-pale",
    text: "text-green",
  },
  shipped: {
    label: "On the way",
    dot: "bg-orange",
    bg: "bg-orange-pale",
    text: "text-orange",
  },
  paid: {
    label: "Paid",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  processing: {
    label: "processing",
    dot: "bg-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
  },
};

type Tab = "overview" | "orders" | "saved" | "addresses" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <SquareChartGantt size={16} /> },
  { id: "orders", label: "Orders", icon: <Package size={16} /> },
  { id: "saved", label: "Saved", icon: <Heart size={16} /> },
  { id: "addresses", label: "My Addresses", icon: <MapPin size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("overview");
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
    queryFn: () => getuserOrders(),
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

  if (ordersLoading || addressesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#f2efe8] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green border-t-transparent animate-spin" />
            <p className="text-xs text-verdant-muted">
              Loading your profile...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (ordersError || addressesError || wishlistError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="Check your connection and try again."
          onRetry={() => {
            refetchOrders();
            refetchAddresses();
            refetchWishlist();
          }}
        />
        <Footer />
      </>
    );
  }

  const initials = user.firstName[0] + (user.lastName?.[0] ?? "");
  const defaultAddress = addresses.find((a) => a.isDefault);
  const totalSpent = (
    orders.reduce((acc, o) => acc + o.totalCents, 0) / 100
  ).toFixed(2);

  // ── Tab label for mobile header ──
  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f2efe8] pt-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex gap-7 items-start">
            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-24 gap-3">
              {/* User card */}
              <div className="bg-[#111f17] rounded-2xl p-5">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-green flex items-center justify-center text-white font-playfair font-bold text-lg">
                      {initials}
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-light rounded-full border-2 border-[#111f17] flex items-center justify-center">
                        <CircleCheckBig size={36} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-white/40 text-[0.65rem] truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-xl px-3 py-2.5">
                    <p className="font-playfair font-bold text-green-light text-lg leading-none">
                      {orders.length}
                    </p>
                    <p className="text-white/40 text-[0.6rem] mt-0.5">Orders</p>
                  </div>
                  <div className="bg-white/5 rounded-xl px-3 py-2.5">
                    <p className="font-playfair font-bold text-orange text-lg leading-none truncate">
                      £{totalSpent}
                    </p>
                    <p className="text-white/40 text-[0.6rem] mt-0.5">Spent</p>
                  </div>
                </div>

                {/* Member since */}
                <p className="text-white/25 text-[0.6rem] mt-4 text-center">
                  Member since {convertDate(user.createdAt)}
                </p>
              </div>

              {/* Nav */}
              <nav className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
                {TABS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-150 ${
                      i < TABS.length - 1 ? "border-b border-[#f5f2ec]" : ""
                    } ${
                      tab === t.id
                        ? "bg-green-pale text-green"
                        : "text-verdant-muted hover:bg-[#faf8f4] hover:text-verdant-dark"
                    }`}
                  >
                    <span
                      className={tab === t.id ? "text-green" : "text-[#bbb]"}
                    >
                      {t.icon}
                    </span>
                    {t.label}
                    {tab === t.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Sign out */}
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-[#aaa] hover:text-red-400 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </aside>

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Mobile: user strip + tab switcher */}
              <div className="lg:hidden">
                {/* User strip */}
                <div className="bg-[#111f17] rounded-2xl p-4 flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center text-white font-playfair font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-white/40 text-[0.65rem] truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="bg-white/5 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="font-bold text-green-light text-sm leading-none">
                        {orders.length}
                      </p>
                      <p className="text-white/30 text-[0.55rem]">orders</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                        tab === t.id
                          ? "bg-green text-white"
                          : "bg-white border border-[#e8e4dc] text-verdant-muted hover:border-green/30 hover:text-green"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Page heading ── */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-playfair font-black text-verdant-dark text-2xl md:text-3xl">
                    {activeTab?.label}
                  </h1>
                  {tab === "overview" && (
                    <p className="text-xs text-verdant-muted mt-0.5">
                      Here&apos;s what&apos;s going on with your account
                    </p>
                  )}
                </div>
              </div>

              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
                <div className="flex flex-col gap-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5 flex items-center gap-4">
                      orders{" "}
                      <div className="w-10 h-10 bg-green-pale rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="font-playfair font-black text-green text-2xl md:text-3xl leading-none">
                          {orders.length}
                        </p>
                        <p className="text-xs text-verdant-muted mt-1">
                          {orders.length === 1
                            ? "Order placed"
                            : "Orders placed"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e8e4dc] p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-pale rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        💳
                      </div>
                      <div>
                        <p className="font-playfair font-black text-orange text-2xl md:text-3xl leading-none truncate">
                          £{totalSpent}
                        </p>
                        <p className="text-xs text-verdant-muted mt-1">
                          Total spent
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Latest order */}
                  <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#f0ede6] flex items-center justify-between">
                      <h3 className="font-semibold text-verdant-dark text-sm">
                        Latest Order
                      </h3>
                      {orders.length > 0 && (
                        <button
                          onClick={() => setTab("orders")}
                          className="text-xs text-green font-medium hover:underline"
                        >
                          View all →
                        </button>
                      )}
                    </div>

                    {ordersLoading ? (
                      <div className="p-5">
                        <div className="h-24 bg-[#f5f2ec] rounded-xl animate-pulse" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-green-pale rounded-xl flex items-center justify-center text-xl">
                          🛒
                        </div>
                        <div>
                          <p className="font-semibold text-verdant-dark text-sm">
                            No orders yet
                          </p>
                          <p className="text-xs text-verdant-muted mt-1 leading-relaxed">
                            Your first order will appear here
                          </p>
                        </div>
                        <Link
                          href="/shop"
                          className="text-xs font-semibold bg-green text-white px-4 py-2 rounded-full hover:bg-green-mid transition-all"
                        >
                          Browse the shop
                        </Link>
                      </div>
                    ) : (
                      (() => {
                        const order = orders[0];
                        const cfg = STATUS_CONFIG[order.status as OrderStatus];
                        return (
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="font-mono text-[0.65rem] text-verdant-muted tracking-wider">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm font-semibold text-verdant-dark mt-0.5">
                                  {convertDate(order.createdAt)}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.bg}`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                                />
                                <span
                                  className={`text-xs font-semibold ${cfg.text}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                              {order.items.slice(0, 4).map((p) => (
                                <div
                                  key={p.id}
                                  className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#f0ede6]"
                                >
                                  <Image
                                    src={p.image}
                                    alt={p.productName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-12 h-12 rounded-xl bg-green-pale flex items-center justify-center text-green text-xs font-bold flex-shrink-0">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[#f5f2ec]">
                              <span className="text-xs text-verdant-muted">
                                {order.items.length}{" "}
                                {order.items.length === 1 ? "item" : "items"}
                              </span>
                              <span className="font-playfair font-black text-orange text-lg">
                                £{(order.totalCents / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Default address */}
                  <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#f0ede6] flex items-center justify-between">
                      <h3 className="font-semibold text-verdant-dark text-sm">
                        Default Address
                      </h3>
                      {defaultAddress && (
                        <button
                          onClick={() => setTab("addresses")}
                          className="text-xs text-green font-medium hover:underline"
                        >
                          Manage →
                        </button>
                      )}
                    </div>

                    {!defaultAddress ? (
                      <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-green-pale rounded-xl flex items-center justify-center text-xl">
                          📍
                        </div>
                        <div>
                          <p className="font-semibold text-verdant-dark text-sm">
                            No address saved
                          </p>
                          <p className="text-xs text-verdant-muted mt-1 leading-relaxed">
                            Add a delivery address for faster checkout
                          </p>
                        </div>
                        <button
                          onClick={() => setTab("addresses")}
                          className="text-xs font-semibold bg-green text-white px-4 py-2 rounded-full hover:bg-green-mid transition-all"
                        >
                          Add address
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 flex items-start gap-3">
                        <div className="w-9 h-9 bg-green-pale rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin size={15} className="text-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-verdant-dark">
                            {defaultAddress.firstName} {defaultAddress.lastName}
                          </p>
                          <p className="text-xs text-verdant-muted mt-0.5 leading-relaxed">
                            {defaultAddress.streetAddress}
                            <br />
                            {defaultAddress.state} State
                          </p>
                          <p className="text-xs text-verdant-muted mt-1">
                            {defaultAddress.phone1}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Getting started — new users only */}
                  {orders.length === 0 && !ordersError && (
                    <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
                      <div className="px-5 py-4 border-b border-[#f0ede6]">
                        <h3 className="font-semibold text-verdant-dark text-sm">
                          Get started
                        </h3>
                        <p className="text-xs text-verdant-muted mt-0.5">
                          A few things to set you up
                        </p>
                      </div>
                      <div className="px-5 py-1 divide-y divide-[#f5f2ec]">
                        {[
                          {
                            done: true,
                            icon: "✅",
                            label: "Create your account",
                            desc: "You're in",
                            action: undefined,
                            href: undefined,
                          },
                          {
                            done: !!defaultAddress,
                            icon: "📍",
                            label: "Add a delivery address",
                            desc: "Faster checkout every time",
                            action: () => setTab("addresses"),
                            href: undefined,
                          },
                          {
                            done: orders.length > 0,
                            icon: "🛒",
                            label: "Place your first order",
                            desc: "Farm-fresh produce at your door",
                            action: undefined,
                            href: "/shop",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-3 py-3.5"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${item.done ? "bg-green-pale text-green font-bold" : "bg-[#f5f2ec]"}`}
                            >
                              {item.done ? "✓" : item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium ${item.done ? "text-verdant-muted line-through" : "text-verdant-dark"}`}
                              >
                                {item.label}
                              </p>
                              <p className="text-[0.65rem] text-verdant-muted mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                            {!item.done && item.action && (
                              <button
                                onClick={item.action}
                                className="text-xs text-green font-medium hover:underline flex-shrink-0"
                              >
                                Go →
                              </button>
                            )}
                            {!item.done && item.href && (
                              <Link
                                href={item.href}
                                className="text-xs text-green font-medium hover:underline flex-shrink-0"
                              >
                                Go →
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ORDERS ── */}
              {tab === "orders" &&
                (ordersLoading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-[#faf8f4] rounded-2xl border border-[#e8e4dc] animate-pulse"
                      />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#faf8f4] rounded-2xl border border-[#e8e4dc] px-8 py-16 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-green-pale rounded-2xl flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <div>
                      <p className="font-playfair font-bold text-verdant-dark text-lg">
                        No orders yet
                      </p>
                      <p className="text-sm text-verdant-muted mt-1 max-w-[220px] mx-auto leading-relaxed">
                        Your orders will appear here once you&apos;ve made your
                        first purchase
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      className="text-sm font-semibold bg-green text-white px-6 py-3 rounded-full hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.25)]"
                    >
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ))}

              {/* ── SAVED ── */}
              {tab === "saved" && <Wishlist items={wishlist} />}

              {/* ── ADDRESSES ── */}
              {tab === "addresses" && <AddressesTab />}

              {/* ── SETTINGS ── */}
              {tab === "settings" && <SettingsTab user={user} />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
