"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/store";
import { getOrderBySessionId } from "@/lib/api";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearCart();
    removeCoupon();
    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, [clearCart, removeCoupon]);

  const { data: order } = useQuery({
    queryKey: ["order", sessionId],
    queryFn: async () => {
      const response = await getOrderBySessionId(sessionId!);
      return response.data;
    },
    enabled: !!sessionId && ready,
  });

  // ── Loading state ──
  if (!ready) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-green-pale" />
          <div className="absolute inset-0 rounded-full border-4 border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🌱
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-verdant-dark">
            Confirming your order...
          </p>
          <p className="text-xs text-verdant-muted mt-1">
            Our farmers are being notified
          </p>
        </div>
      </div>
    );
  }

  // ── Confirmed state ──
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cream pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* ── Success card ── */}
          <div className="bg-white rounded-3xl border border-green/10 overflow-hidden shadow-[0_8px_40px_rgba(45,106,79,0.1)]">
            {/* Green header strip */}
            <div className="bg-green px-8 pt-10 pb-12 text-center relative overflow-hidden">
              <span className="absolute top-3 left-6 text-5xl opacity-10 select-none">
                🌿
              </span>
              <span className="absolute top-3 right-6 text-5xl opacity-10 select-none">
                🌾
              </span>

              {/* Checkmark */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="font-playfair font-black text-white text-3xl mb-2">
                Order Confirmed!
              </h1>
              <p className="text-white/75 text-sm max-w-xs mx-auto leading-relaxed">
                Your fresh produce is being prepared. Our farmers have been
                notified.
              </p>
            </div>

            {/* Bump connector */}
            <div className="bg-green h-4 relative">
              <div className="absolute inset-x-0 bottom-0 h-4 bg-white rounded-t-[2rem]" />
            </div>

            {/* Content */}
            <div className="px-8 pb-8 -mt-1">
              {/* Order number */}
              {order?.orderNumber && (
                <div className="bg-green-pale rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-green font-semibold mb-0.5">
                      Order Number
                    </p>
                    <p className="font-playfair font-bold text-verdant-dark text-lg">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="text-3xl">🧾</div>
                </div>
              )}

              {/* What's next */}
              <div className="mb-6">
                <h3 className="font-playfair font-bold text-verdant-dark text-lg mb-4">
                  What happens next?
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: "📧",
                      title: "Confirmation email",
                      desc: "Check your inbox for order details",
                    },
                    {
                      icon: "🚜",
                      title: "Farm picks your order",
                      desc: "Harvested fresh on the morning of delivery",
                    },
                    {
                      icon: "📦",
                      title: "Out for delivery",
                      desc: "We'll notify you when it's on the way",
                    },
                    {
                      icon: "🌿",
                      title: "Enjoy your produce",
                      desc: "Farm fresh, just as nature intended",
                    },
                  ].map((step, i) => (
                    <div key={step.title} className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-green-pale rounded-xl flex items-center justify-center text-lg">
                          {step.icon}
                        </div>
                        {/* Connector line */}
                        {i < 3 && (
                          <div className="absolute left-1/2 top-10 w-px h-3 bg-green/20 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p className="text-sm font-semibold text-verdant-dark">
                          {step.title}
                        </p>
                        <p className="text-xs text-verdant-muted mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harvest promise */}
              <div className="bg-verdant-dark rounded-2xl p-5 flex items-start gap-4 mb-6">
                <div className="text-2xl flex-shrink-0">🌱</div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    Same-day harvest guarantee
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed mt-1">
                    Your produce goes from field to packing on the morning of
                    delivery — never stored, always fresh.
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center gap-1.5 bg-green-pale text-green py-4 rounded-2xl text-xs font-semibold hover:bg-green hover:text-white transition-all duration-200"
                >
                  <span className="text-xl">🏠</span>
                  Home
                </Link>
                <Link
                  href="/account/orders"
                  className="flex flex-col items-center justify-center gap-1.5 bg-green text-white py-4 rounded-2xl text-xs font-semibold hover:bg-green-mid transition-all duration-200"
                >
                  <span className="text-xl">📦</span>
                  My Orders
                </Link>
                <Link
                  href="/shop"
                  className="flex flex-col items-center justify-center gap-1.5 bg-green-pale text-green py-4 rounded-2xl text-xs font-semibold hover:bg-green hover:text-white transition-all duration-200"
                >
                  <span className="text-xl">🛒</span>
                  Shop
                </Link>
              </div>
            </div>
          </div>

          {/* Below card note */}
          <p className="text-center text-xs text-verdant-muted mt-6">
            Questions? Contact us at{" "}
            <a
              href="mailto:hello@verdant.com"
              className="text-green hover:underline"
            >
              hello@verdant.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
