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

  const FREE_DELIVERY_THRESHOLD = 10000; // pence
  const progressPct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const amountLeft = ((FREE_DELIVERY_THRESHOLD - subtotal) / 100).toFixed(2);
  const hasFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

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

      setDiscount(discountApi);
      setTotal(totalApi);
      setDelivery(deliveryApi);

      if (discountApi > 0) {
        await applyCouponApi(coupon);
        setCouponSuccess("Coupon applied!");
        applyCouponToStore(coupon, res.data.discountPence);
      } else {
        setCouponError("This coupon has no discount value");
      }
    } catch (err) {
      setCouponError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-20 md:pt-24 bg-cream min-h-screen">
        {/* ── Page header ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:py-10 border-b border-green/10">
          <p className="text-xs tracking-[0.15em] uppercase text-green mb-2">
            Your Selection
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-playfair font-black text-verdant-dark text-3xl md:text-5xl">
                Basket
              </h1>
              <p className="text-verdant-muted mt-1.5 text-sm">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Free delivery pill — shown in header on desktop */}
            {cartItems.length > 0 && (
              <div
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium ${
                  hasFreeDelivery
                    ? "bg-green-pale border-green/20 text-green"
                    : "bg-white border-[#e5e5e5] text-verdant-muted"
                }`}
              >
                {hasFreeDelivery ? (
                  <>
                    <span>🎉</span> Free delivery unlocked
                  </>
                ) : (
                  <>
                    <span>🚚</span> £{amountLeft} away from free delivery
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Empty state ── */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-8">
            <div className="w-20 h-20 bg-green-pale rounded-2xl flex items-center justify-center text-4xl mb-6">
              🛒
            </div>
            <h2 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl mb-3">
              Your basket is empty
            </h2>
            <p className="text-verdant-muted max-w-sm mb-8 leading-relaxed">
              Looks like you haven&apos;t added anything yet. Let&apos;s fix
              that.
            </p>
            <Link
              href="/shop"
              className="bg-green text-white px-8 md:px-10 py-3.5 rounded-full font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
            >
              Browse Produce →
            </Link>
          </div>
        ) : (
          <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-8 md:py-12 flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
            {/* ── Left — items ── */}
            <div>
              {/* Delivery progress bar */}
              <div className="bg-white rounded-2xl p-5 mb-5 border border-green/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-verdant-dark">
                    {hasFreeDelivery
                      ? "Free delivery unlocked 🎉"
                      : "Spend more, save on delivery"}
                  </span>
                  <span
                    className={`text-xs font-semibold ${hasFreeDelivery ? "text-green" : "text-verdant-muted"}`}
                  >
                    {hasFreeDelivery
                      ? "You qualify!"
                      : `£${(subtotal / 100).toFixed(2)} / £${(FREE_DELIVERY_THRESHOLD / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="h-2.5 bg-green-pale rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${hasFreeDelivery ? "bg-green" : "bg-green-light"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {!hasFreeDelivery && (
                  <p className="text-xs text-verdant-muted mt-2">
                    Add £{amountLeft} more to unlock free delivery
                  </p>
                )}
              </div>

              {/* Cart items */}
              <div className="flex flex-col gap-3">
                {cartItems.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-2xl border border-green/10 hover:border-green/20 hover:shadow-sm transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-4 md:p-5 flex gap-4 items-start">
                      {/* Thumbnail */}
                      <Link
                        href={`/product/${p.slug}`}
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 group"
                      >
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.65rem] text-verdant-muted uppercase tracking-wider mb-0.5 hidden sm:block">
                          {p.farm}
                        </p>
                        <Link href={`/product/${p.slug}`}>
                          <p className="font-playfair font-bold text-verdant-dark text-base md:text-[1.05rem] leading-snug hover:text-green transition-colors">
                            {p.name}
                          </p>
                        </Link>
                        <p className="text-xs text-verdant-muted mt-0.5">
                          {p.unit}
                        </p>

                        {p.isOrganic && (
                          <span className="hidden sm:inline-flex mt-2 text-[0.58rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
                            Organic
                          </span>
                        )}

                        {/* Bottom row: quantity + price */}
                        <div className="flex items-center justify-between mt-3 gap-3">
                          {/* Quantity stepper */}
                          <div className="flex items-center rounded-full border border-[#e5e5e5] overflow-hidden w-fit">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  p.productId,
                                  -1,
                                  p.quantity,
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base font-medium"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-verdant-dark">
                              {p.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(p.productId, 1, p.quantity)
                              }
                              className="w-8 h-8 flex items-center justify-center text-verdant-muted hover:bg-green-pale hover:text-green transition-colors text-base font-medium"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-verdant-dark text-base">
                              £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                            </p>
                            {p.quantity > 1 && (
                              <p className="text-[0.68rem] text-[#bbb]">
                                £{(p.pricePence / 100).toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(p.productId)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#ccc] hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 mt-6 text-green text-sm font-medium hover:opacity-60 transition-opacity"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* ── Right — order summary ── */}
            <div className="w-full lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#f0f0f0]">
                  <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                    Order Summary
                  </h2>
                  <p className="text-xs text-verdant-muted mt-0.5">
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Line items */}
                <div className="px-6 py-4 flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                  {cartItems.map((p) => (
                    <div
                      key={p.slug}
                      className="flex justify-between text-sm gap-3"
                    >
                      <span className="text-verdant-muted truncate">
                        {p.name}
                        <span className="ml-1 text-[#bbb] text-xs">
                          ×{p.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-verdant-dark flex-shrink-0">
                        £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="px-6 py-4 border-t border-[#f0f0f0]">
                  <div
                    className={`flex rounded-xl overflow-hidden border transition-colors ${
                      couponError
                        ? "border-rose-300"
                        : couponSuccess
                          ? "border-green/30"
                          : "border-[#e5e5e5]"
                    }`}
                  >
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      disabled={!!couponSuccess}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent outline-none px-4 py-3 text-sm text-verdant-dark placeholder:text-[#ccc] disabled:opacity-50 font-mono tracking-wider"
                    />
                    {couponSuccess ? (
                      <span className="flex items-center px-4 text-xs text-green font-bold">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={handleCoupon}
                        className="px-4 text-xs font-bold text-green hover:text-white hover:bg-green border-l border-[#e5e5e5] transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  <div className="min-h-[1.2rem] mt-1.5">
                    {couponError && (
                      <p className="text-xs text-rose-500">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-xs text-green">{couponSuccess}</p>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="px-6 py-4 border-t border-[#f0f0f0] flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-verdant-muted">Subtotal</span>
                    <span className="font-medium text-verdant-dark">
                      £{(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green">
                        Discount ({coupon.toUpperCase()})
                      </span>
                      <span className="text-green font-medium">
                        −£{Number(discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-verdant-muted">Delivery</span>
                    <span
                      className={`font-medium ${(delivery ?? shippingFee) === 0 ? "text-green" : "text-verdant-dark"}`}
                    >
                      {(delivery ?? shippingFee) === 0
                        ? "Free 🎉"
                        : `£${(delivery ?? shippingFee).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="h-px bg-[#f0f0f0] my-0.5" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-verdant-dark">
                      Total
                    </span>
                    <span className="font-playfair font-bold text-green text-2xl">
                      £{(total ?? totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <Link
                    href="/checkout"
                    className="block w-full bg-green text-white text-center py-3.5 rounded-full font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)]"
                  >
                    Proceed to Checkout →
                  </Link>
                  <div className="flex items-center justify-center gap-4 mt-3.5">
                    <span className="text-[0.62rem] text-[#bbb]">
                      🔒 Secure checkout
                    </span>
                    <span className="text-[#e0e0e0]">·</span>
                    <span className="text-[0.62rem] text-[#bbb]">
                      🚜 Same-day harvest
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                {[
                  { icon: "🌱", label: "Organic options" },
                  { icon: "♻️", label: "Eco packaging" },
                  { icon: "↩️", label: "Easy returns" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="bg-white rounded-xl p-3 text-center border border-green/10"
                  >
                    <div className="text-xl mb-1">{b.icon}</div>
                    <div className="text-[0.6rem] text-verdant-muted leading-tight">
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
