"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { OrderCard } from "@/components/OrderCard";

import Wishlist from "@/components/Wishlist";
import { useWishlist } from "@/hooks";
import { getUserAddress, getuserOrders } from "@/lib/api";
import { convertDate } from "@/lib/api/helpers";
import { useAuthStore } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type OrderStatus = "delivered" | "on-the-way" | "paid";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  delivered: {
    label: "Delivered",
    dot: "bg-green",
    bg: "bg-green-pale",
    text: "text-green",
  },
  "on-the-way": {
    label: "On the way",
    dot: "bg-orange",
    bg: "bg-orange-pale",
    text: "text-orange",
  },
  paid: {
    label: "paid",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
};

export type StatusConfig = typeof STATUS_CONFIG;

// ─────────────────────────────────────────────
type Tab = "overview" | "orders" | "saved" | "settings";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const user = useAuthStore((state) => state.user);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getuserOrders();
      return res.data;
    },
  });

  console.log("tho", orders);

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await getUserAddress();
      return res.data;
    },
  });

  const { wishlist } = useWishlist();

  const defaultAddress = addresses.find((a) => a.isDefault);

  if (!user) return null;
  const initials = user!.firstName[0] + user!.lastName[0];

  if (isLoading) return <div>isloading...</div>;

  const result = orders.reduce((acc, ord) => acc + ord.totalCents, 0);
  const totalSpent = (result / 100).toFixed(2);

  const handleSave = () => {
    // TODO: call PATCH /auth/me with `form`
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "⊞" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "saved", label: "Saved", icon: "♡" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <>
      <Navbar />

      <main className="pt-24 bg-cream min-h-screen">
        {/* ── Profile Header ── */}
        <div className="px-20 py-10 border-b border-green/10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green to-orange flex items-center justify-center text-white font-playfair font-bold text-2xl shadow-lg">
                {initials}
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green rounded-full border-2 border-cream flex items-center justify-center">
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="white">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="flex-1">
              <h1 className="font-playfair font-black text-verdant-dark text-3xl">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-sm text-verdant-muted">{user.email}</span>
                <span className="text-[#ddd]">·</span>
                <span className="text-sm text-verdant-muted">
                  Member since {convertDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  tab === t.id
                    ? "bg-green text-white shadow-sm"
                    : "text-verdant-muted hover:text-green hover:bg-green-pale"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="px-20 py-10">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="flex flex-col gap-8">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Total orders",
                    value: orders.length,
                    suffix: "",
                    color: "green",
                    icon: "📦",
                  },
                  {
                    label: "Total spent",
                    value: `£${totalSpent}`,
                    suffix: "",
                    color: "orange",
                    icon: "💳",
                  },
                  //   {
                  //     label: "Saved items",
                  //     value: MOCK_STATS.savedItems,
                  //     suffix: "",
                  //     color: "green",
                  //     icon: "♡",
                  //   },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`bg-white rounded-2xl p-6 border ${
                      s.color === "green"
                        ? "border-green/10"
                        : "border-orange/10"
                    }`}
                  >
                    <div className="text-2xl mb-3">{s.icon}</div>
                    <div
                      className={`font-playfair font-bold text-2xl ${
                        s.color === "green" ? "text-green" : "text-orange"
                      }`}
                    >
                      {s.value}
                      {s.suffix}
                    </div>
                    <div className="text-xs text-verdant-muted mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Latest order + saved side by side */}
              <div className="grid grid-cols-[1fr_340px] gap-6">
                {/* Latest order */}
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#f0f0f0] flex justify-between items-center">
                    <h2 className="font-playfair font-bold text-verdant-dark text-lg">
                      Latest Order
                    </h2>
                    <button
                      onClick={() => setTab("orders")}
                      className="text-xs text-green hover:underline font-medium"
                    >
                      View all →
                    </button>
                  </div>
                  {orders &&
                    (() => {
                      const order = orders[0];
                      const orderStatus = order.status;
                      const cfg = STATUS_CONFIG[orderStatus as OrderStatus];
                      return (
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
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
                                className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                              />
                              <span
                                className={`text-xs font-semibold ${cfg.text}`}
                              >
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                          {/* Product thumbnails */}
                          <div className="flex gap-3 mb-4">
                            {order.items.slice(0, 3).map((p) => (
                              <div
                                key={p.id}
                                className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                              >
                                <Image
                                  src={p.image}
                                  alt={p.productName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-16 h-16 rounded-xl bg-green-pale flex items-center justify-center text-green text-sm font-semibold flex-shrink-0">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
                            <span className="text-sm text-verdant-muted">
                              {order.items.length} items
                            </span>
                            <span className="font-playfair font-bold text-green text-xl">
                              £{(order.totalCents / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>

                {/* Delivery address */}
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#f0f0f0] flex justify-between items-center">
                    <h2 className="font-playfair font-bold text-verdant-dark text-lg">
                      Saved Address
                    </h2>
                    <button
                      onClick={() => setTab("settings")}
                      className="text-xs text-green hover:underline font-medium"
                    >
                      Edit →
                    </button>
                  </div>
                  <div className="p-6 flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-green-pale rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        🏠
                      </div>
                      <div>
                        <div className="text-xs text-verdant-muted mb-0.5">
                          {defaultAddress?.firstName} {defaultAddress?.lastName}
                        </div>
                        <div className="text-sm font-medium text-verdant-dark">
                          {defaultAddress?.streetAddress}
                        </div>
                        <div className="text-sm text-verdant-muted">
                          {defaultAddress?.state} State
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-[#f0f0f0]" />
                    <Link
                      href="/checkout"
                      className="w-full text-center bg-orange text-white py-3 rounded-full text-sm font-semibold hover:bg-orange-dark transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(232,106,46,0.28)]"
                    >
                      Quick Reorder →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" &&
            orders.map((order) => <OrderCard key={order.id} order={order} />)}

          {tab === "saved" && <Wishlist items={wishlist} />}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="max-w-xl flex flex-col gap-6">
              <h2 className="font-playfair font-bold text-verdant-dark text-2xl">
                Account Settings
              </h2>

              {/* Personal info */}
              <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f0f0f0]">
                  <h3 className="font-semibold text-verdant-dark">
                    Personal Information
                  </h3>
                  <p className="text-xs text-verdant-muted mt-0.5">
                    Updates sync to your delivery & order history
                  </p>
                </div>
                <div className="px-6 py-6 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    {(["firstName", "lastName"] as const).map((field) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                          {field === "firstName" ? "First name" : "Last name"}
                        </label>
                        <input
                          type="text"
                          value={form[field]}
                          onChange={(e) =>
                            setForm({ ...form, [field]: e.target.value })
                          }
                          className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark pr-24"
                      />
                      {MOCK_USER.isVerified && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] bg-green-pale text-green font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                      Delivery Postcode
                    </label>
                    <input
                      type="text"
                      value={form.postcode}
                      onChange={(e) =>
                        setForm({ ...form, postcode: e.target.value })
                      }
                      className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f0f0f0]">
                  <h3 className="font-semibold text-verdant-dark">Password</h3>
                  <p className="text-xs text-verdant-muted mt-0.5">
                    Leave blank to keep your current password
                  </p>
                </div>
                <div className="px-6 py-6 flex flex-col gap-4">
                  {[
                    "Current password",
                    "New password",
                    "Confirm new password",
                  ].map((label) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider">
                        {label}
                      </label>
                      {/* TODO: wire to PATCH /auth/me with password fields */}
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f0f0f0]">
                  <h3 className="font-semibold text-verdant-dark">
                    Notifications
                  </h3>
                </div>
                <div className="px-6 py-6 flex flex-col divide-y divide-[#f5f5f5]">
                  {[
                    {
                      label: "Order updates",
                      desc: "Dispatch, out for delivery, delivered",
                      on: true,
                    },
                    {
                      label: "Harvest alerts",
                      desc: "When new seasonal produce arrives",
                      on: true,
                    },
                    {
                      label: "Loyalty points",
                      desc: "When you earn or can redeem points",
                      on: false,
                    },
                    {
                      label: "Promotions & offers",
                      desc: "Discounts and member-only deals",
                      on: false,
                    },
                  ].map((n) => (
                    <div
                      key={n.label}
                      className="flex items-center justify-between py-4"
                    >
                      <div>
                        <div className="text-sm font-medium text-verdant-dark">
                          {n.label}
                        </div>
                        <div className="text-xs text-verdant-muted mt-0.5">
                          {n.desc}
                        </div>
                      </div>
                      {/* TODO: wire toggle to PATCH /auth/me notification prefs */}
                      <button
                        className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
                          n.on ? "bg-green" : "bg-[#e5e5e5]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            n.on ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="bg-green text-white px-10 py-3.5 rounded-full font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
                >
                  {saved ? "✓ Saved" : "Save Changes"}
                </button>
                {/* TODO: wire to DELETE /auth/me with confirmation dialog */}
                <button className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors">
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
