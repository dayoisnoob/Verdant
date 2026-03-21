"use client";

import AddressesTab from "@/components/AddressTab";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OverviewTab from "@/components/OverviewTab";
import SettingsTab from "@/components/SettingsTab";
import Wishlist from "@/components/Wishlist";
import { useOrders, useWishlist } from "@/hooks";
import { getUserAddresses } from "@/lib/api";
import { useAuthStore } from "@/store/store";
import { FilterStatus } from "@/types";
import { Tab } from "@/types/order.types";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Settings,
  SquareChartGantt,
} from "lucide-react";
import { useState } from "react";
import { convertDate } from "@/lib/helpers";
import OrdersTab from "@/components/OrdersTab";

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

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState<FilterStatus>("all");

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    orders,
    filtered: filteredOrders,
    counts: orderCounts,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isError: ordersError,
  } = useOrders();

  const { wishlist, wishlistError, refetchWishlist } = useWishlist();

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
    orders.reduce((acc, o) => acc + o.totalPence, 0) / 100
  ).toFixed(2);

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-8">
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
                <OverviewTab
                  orders={orders}
                  totalSpent={totalSpent}
                  defaultAddress={defaultAddress}
                  setTab={setTab}
                />
              )}

              {tab === "orders" && (
                <OrdersTab
                  orders={orders}
                  filteredOrders={filteredOrders}
                  orderCounts={orderCounts}
                  orderFilter={orderFilter}
                  setOrderFilter={setOrderFilter}
                />
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
