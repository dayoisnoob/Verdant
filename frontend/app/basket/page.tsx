"use client";

import Footer from "@/components/Footer";
import MightLike from "@/components/MightLike";
import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks";
import {
  applyCouponApi,
  getCartTotal,
  getProducts,
  updateItem,
} from "@/lib/api";
import { calculateOrderTotal } from "@/lib/api/helpers";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const {
    items: cartItems,
    subtotal,
    removeItem,
    updateQuantity,
    applyCoupon: applyCouponToStore,
  } = useCart();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const { data: PRODUCTS } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts(undefined, undefined, 1, 999);
      return res.data;
    },
  });

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<number | null>(null);

  const discountedSubtotal = Number(subtotal) - discount;
  const { shippingFee, totalAmount } = calculateOrderTotal(discountedSubtotal);

  if (!PRODUCTS) return null;
  const SUGGESTED = PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);

  const handleUpdateQuantity = async (
    itemId: string,
    delta: number,
    currentQuantity: number,
  ) => {
    const newQuantity = currentQuantity + delta;
    updateQuantity(itemId, delta);
    await updateItem({ itemId, newQuantity });
  };

  const handleRemoveItem = async (id: string) => {
    removeItem(id);
  };

  const handleCoupon = async () => {
    setCouponError("");

    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!isLoggedIn) {
      setCouponError("Please log in to apply a coupon");
      return;
    }

    try {
      const res = await getCartTotal(coupon);
      const discountApi = parseFloat((res.data.discountPence / 100).toFixed(2));
      const totalApi = parseFloat((res.data.totalPence / 100).toFixed(2));
      const deliveryApi = parseFloat((res.data.deliveryPence / 100).toFixed(2));

      console.log(discountApi, totalApi, deliveryApi);

      setDiscount(discountApi);
      setTotal(totalApi);
      setDelivery(deliveryApi);

      if (discountApi > 0) {
        await applyCouponApi(coupon);
        setCouponSuccess("Coupon applied successfully!");
        applyCouponToStore(coupon, res.data.discountPence);
      } else {
        setCouponError("This coupon has no discount value");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setCouponError(err.message);
      } else {
        setCouponError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-20 md:pt-24 bg-cream min-h-screen">
        {/* ── Header ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:py-10 border-b border-green/10">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Your Selection
          </p>
          <h1 className="font-playfair font-black text-verdant-dark text-3xl md:text-5xl">
            Basket
          </h1>
          <p className="text-verdant-muted mt-2 text-sm">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} ·{" "}
            {cartItems.length > 0 &&
              (subtotal / 100 >= 100
                ? "🎉 Free delivery unlocked"
                : `£${100 - subtotal / 100} away from free delivery`)}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-8">
            <div className="text-6xl md:text-7xl mb-6">🛒</div>
            <h2 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl mb-3">
              Your basket is empty
            </h2>
            <p className="text-verdant-muted max-w-sm mb-8">
              Looks like you haven&apos;t added anything yet. Let&apos;s fix
              that.
            </p>
            <Link
              href="/shop"
              className="bg-green text-white px-8 md:px-10 py-4 rounded-full font-medium hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
            >
              Browse Produce →
            </Link>
          </div>
        ) : (
          <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:py-12 flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
            {/* ── Left — Cart Items ── */}
            <div>
              {/* Free delivery progress bar */}
              <div className="bg-white rounded-2xl p-4 md:p-5 mb-5 md:mb-6 border border-green/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-verdant-muted">Delivery progress</span>
                  <span className="font-medium text-green">
                    {subtotal >= 10000
                      ? "Free delivery!"
                      : `£${(subtotal / 100).toFixed(2)} / £100.00`}
                  </span>
                </div>
                <div className="h-2 bg-green-pale rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 10000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3 md:gap-4">
                {cartItems.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-green/10 flex gap-3 md:gap-5 items-center group hover:border-green-light hover:shadow-sm transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${p.slug}`}
                      className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0"
                    >
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.68rem] text-[#aaa] uppercase tracking-wider mb-0.5 hidden sm:block">
                        {p.farm}
                      </div>
                      <Link href={`/product/${p.slug}`}>
                        <div className="font-playfair font-bold text-verdant-dark text-base md:text-lg leading-tight hover:text-green transition-colors">
                          {p.name}
                        </div>
                      </Link>
                      <div className="text-xs text-verdant-muted mt-0.5 md:mt-1">
                        {p.unit}
                      </div>

                      {/* Badges — hide on very small screens */}
                      <div className="hidden sm:flex gap-1.5 mt-2">
                        {p.isOrganic && (
                          <span className="text-[0.58rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
                            Organic
                          </span>
                        )}
                        {/* {p.harvestDaysAgo === 0 && (
                          <span className="text-[0.58rem] font-bold uppercase tracking-wider bg-green-pale text-green px-2 py-0.5 rounded-full">
                            Harvested Today
                          </span>
                        )} */}
                      </div>

                      {/* Price shown inline on mobile only */}
                      <div className="sm:hidden mt-1.5">
                        <span className="font-semibold text-verdant-dark text-sm">
                          £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#bbb] ml-1">
                          £{(p.pricePence / 100).toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity control */}
                    <div className="flex items-center border border-[#e5e5e5] rounded-full overflow-hidden flex-shrink-0">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(p.productId, -1, p.quantity)
                        }
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base md:text-lg font-medium"
                      >
                        −
                      </button>
                      <span className="w-6 md:w-8 text-center text-sm font-semibold text-verdant-dark">
                        {p.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(p.productId, 1, p.quantity)
                        }
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base md:text-lg font-medium"
                      >
                        +
                      </button>
                    </div>

                    {/* Price — hidden on mobile (shown inline above) */}
                    <div className="hidden sm:block text-right flex-shrink-0 min-w-[70px]">
                      <div className="font-semibold text-verdant-dark text-base">
                        £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-[#bbb] mt-0.5">
                        £{(p.pricePence / 100).toFixed(2)} each
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(p.productId)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#ccc] hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Continue shopping */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 mt-5 md:mt-6 text-green text-sm font-medium hover:opacity-65 transition-opacity"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* ── Right — Order Summary ── */}
            {/* On mobile this renders below the cart items, not sticky */}
            <div className="w-full lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                {/* Header */}
                <div className="bg-green-pale px-5 md:px-6 py-4 md:py-5 border-b border-green/10">
                  <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                    Order Summary
                  </h2>
                </div>

                {/* Line items */}
                <div className="px-5 md:px-6 py-4 md:py-5 flex flex-col gap-3">
                  {cartItems.map((p) => (
                    <div key={p.slug} className="flex justify-between text-sm">
                      <span className="text-verdant-muted truncate max-w-[180px]">
                        {p.name} × {p.quantity}
                      </span>
                      <span className="font-medium text-verdant-dark flex-shrink-0 ml-2">
                        £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#f0f0f0] flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-verdant-muted">Subtotal</span>
                    <span className="font-medium">
                      £{(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({coupon.toUpperCase()})
                      </span>
                      <span className="text-green-600">
                        -£{Number(discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-verdant-muted">Delivery</span>
                    <span
                      className={`font-medium ${delivery === 0 ? "text-green" : ""}`}
                    >
                      {(delivery ?? shippingFee) === 0
                        ? "Free 🎉"
                        : `£${(delivery ?? shippingFee).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="h-px bg-[#f0f0f0]" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-verdant-dark">
                      Total
                    </span>
                    <span className="font-playfair font-bold text-green text-xl">
                      £{(total ?? totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="px-5 md:px-6 pb-4 md:pb-5">
                  <div
                    className={`flex gap-2 rounded-full overflow-hidden px-1 py-1 border transition-colors ${
                      couponError
                        ? "border-rose-300"
                        : couponSuccess
                          ? "border-green/40"
                          : "border-[#e5e5e5]"
                    }`}
                  >
                    <input
                      type="text"
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={!!couponSuccess}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent outline-none px-3 text-sm text-verdant-dark placeholder:text-[#ccc] disabled:opacity-50"
                    />
                    {!couponSuccess && (
                      <button
                        onClick={handleCoupon}
                        className="bg-green-pale text-green text-xs font-semibold px-4 py-2 rounded-full hover:bg-green hover:text-white transition-colors"
                      >
                        Apply
                      </button>
                    )}
                    {couponSuccess && (
                      <span className="flex items-center px-3 text-xs text-green font-semibold">
                        ✓ Applied
                      </span>
                    )}
                  </div>

                  {/* Reserve fixed height so layout never shifts */}
                  <div className="min-h-[1.25rem] mt-1">
                    {couponError && (
                      <p className="text-xs text-rose-500">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-xs text-green-600">{couponSuccess}</p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <Link
                    href="/checkout"
                    className="block w-full bg-green text-white text-center py-4 rounded-full font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
                  >
                    Proceed to Checkout →
                  </Link>
                  <div className="flex items-center justify-center gap-3 md:gap-4 mt-4 flex-wrap">
                    <span className="text-[0.65rem] text-[#bbb] flex items-center gap-1">
                      🔒 Secure checkout
                    </span>
                    <span className="text-[#e5e5e5]">·</span>
                    <span className="text-[0.65rem] text-[#bbb]">
                      🚜 Same-day harvest
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4">
                {[
                  { icon: "🌱", label: "100% Organic options" },
                  { icon: "♻️", label: "Eco packaging" },
                  { icon: "↩️", label: "Easy returns" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="bg-white rounded-xl p-2.5 md:p-3 text-center border border-green/10"
                  >
                    <div className="text-lg md:text-xl mb-1">{b.icon}</div>
                    <div className="text-[0.58rem] md:text-[0.6rem] text-verdant-muted leading-tight">
                      {b.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {cartItems.length > 0 && <MightLike suggested={SUGGESTED} />}
      </main>

      <Footer />
    </>
  );
}
