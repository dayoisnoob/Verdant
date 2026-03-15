"use client";

import CartItems from "@/components/CartItems";
import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
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
import { calculateOrderTotal } from "@/lib/helpers";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items: cartItems,
    subtotal,
    removeItem,
    couponCode: appliedCoupon,
    discount: appliedDiscount,
    updateQuantity,
    removeCoupon,
    isLoading,
    cartError,
    applyCoupon: applyCouponToStore,
  } = useCart();

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const {
    data,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => getProducts(undefined, undefined, undefined, 1, 100),
  });

  const PRODUCTS = data?.products;

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const [total, setTotal] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<number | null>(null);

  if (isLoading || productsLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#f2efe8] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green border-t-transparent animate-spin" />
            <p className="text-xs text-verdant-muted">Loading your Basket...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cartError || productsError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="Check your connection and try again."
          onRetry={() => {
            refetchProducts();
          }}
        />
        <Footer />
      </>
    );
  }

  const discountedSubtotal = Number(subtotal) - appliedDiscount;
  const { shippingFee, totalAmount } = calculateOrderTotal(discountedSubtotal);

  if (!PRODUCTS) return null;
  const SUGGESTED = PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);

  const FREE_DELIVERY_THRESHOLD = 10000;
  const progressPct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const amountLeft = (
    (FREE_DELIVERY_THRESHOLD - discountedSubtotal) /
    100
  ).toFixed(2);
  const hasFreeDelivery = discountedSubtotal >= FREE_DELIVERY_THRESHOLD;

  const handleUpdateQuantity = async (
    productId: string,
    delta: number,
    currentQuantity: number,
  ) => {
    const quantity = currentQuantity + delta;

    if (subtotal) updateQuantity(productId, delta);

    try {
      await updateItem({ productId, quantity });
    } catch (err) {
      if (err instanceof ApiError) {
        handleRemoveCoupon(err.message);
        setCouponError(err.message);
      } else {
        setCouponError("Discount value needs to be higher than your subtotal");
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    removeItem(id);
    toast.success("Item removed");
  };

  const handleCouponInput = (e: ChangeEvent<HTMLInputElement>) => {
    setCouponError("");
    setCoupon(e.target.value.toUpperCase());
  };

  const handleRemoveCoupon = (errMsg?: string) => {
    removeCoupon();
    setCoupon("");
    setCouponError(errMsg || "");
    setTotal(null);
    setDelivery(null);
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
      await applyCouponApi(coupon, subtotal);

      const res = await getCartTotal();
      const discountApi = parseFloat((res.discountPence / 100).toFixed(2));
      const totalApi = parseFloat((res.totalPence / 100).toFixed(2));
      const deliveryApi = parseFloat((res.deliveryPence / 100).toFixed(2));

      // setDiscount(discountApi);
      setTotal(totalApi);
      setDelivery(deliveryApi);

      if (discountApi > 0) {
        applyCouponToStore(coupon, res.discountPence);
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
    <Container>
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
                      : `£${(discountedSubtotal / 100).toFixed(2)} / £${(FREE_DELIVERY_THRESHOLD / 100).toFixed(2)}`}
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
              <CartItems
                items={cartItems}
                handleRemoveItem={handleRemoveItem}
                handleUpdateQuantity={handleUpdateQuantity}
              />

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
                        : appliedCoupon
                          ? "border-green/30"
                          : "border-[#e5e5e5]"
                    }`}
                  >
                    <input
                      type="text"
                      value={appliedCoupon || coupon}
                      onChange={handleCouponInput}
                      disabled={!!appliedCoupon}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent outline-none px-4 py-3 text-sm text-verdant-dark placeholder:text-[#ccc] disabled:opacity-50 font-mono tracking-wider"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={() => handleRemoveCoupon()}
                        className="px-4 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-400 border-l border-[#e5e5e5] transition-colors"
                      >
                        Remove
                      </button>
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
                    {appliedCoupon && (
                      <p className="text-xs text-green">Coupon Applied</p>
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
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green">
                        Discount ({coupon.toUpperCase()})
                      </span>
                      <span className="text-green font-medium">
                        −£{Number(appliedDiscount / 100).toFixed(2)}
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
    </Container>
  );
}
