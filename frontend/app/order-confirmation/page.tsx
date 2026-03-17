"use client";

import { CheckoutSteps } from "@/components/CheckoutSteps";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks";
import { getOrderBySessionId, removeCoupon } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearCart();
    removeCoupon();

    window.history.replaceState(
      null,
      "",
      "/order-confirmation?session_id=" + sessionId,
    );

    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, [clearCart, sessionId]);

  const { data: orderNumber, isError } = useQuery({
    queryKey: ["order", sessionId],
    queryFn: async () => await getOrderBySessionId(sessionId!),
    enabled: !!sessionId && ready,
  });

  useEffect(() => {
    if (isError || (!sessionId && ready)) {
      router.replace("/account/orders");
    }
  }, [isError, sessionId, ready, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-green-pale" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            🌱
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-verdant-dark">
            Confirming your order…
          </p>
          <p className="text-xs text-verdant-muted mt-1">
            Our farmers are being notified
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-cream border-b border-green/10">
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-playfair text-xl font-black text-green"
            >
              Ver<em className="not-italic text-green-light">dant</em>
            </Link>
          </div>
          <CheckoutSteps active={3} />
        </div>
      </div>

      <main className="min-h-screen bg-cream py-10 md:py-16 px-4">
        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
            <div className="px-6 pt-8 pb-7 text-center border-b border-[#f5f5f5]">
              <div className="w-14 h-14 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-green"
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

              <h1 className="font-playfair font-black text-verdant-dark text-2xl md:text-3xl mb-2">
                Order Confirmed
              </h1>
              <p className="text-sm text-verdant-muted leading-relaxed max-w-[260px] mx-auto">
                Your order is in. A confirmation email is on its way to you now.
              </p>

              {orderNumber && (
                <div className="inline-flex items-center gap-2 mt-5 bg-green-pale px-4 py-2 rounded-full">
                  <span className="text-xs text-verdant-muted">Order</span>
                  <span className="font-mono font-bold text-green text-sm tracking-wide">
                    {orderNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-verdant-muted mb-5">
                What happens next
              </p>

              <div className="flex flex-col">
                {[
                  {
                    icon: "📧",
                    title: "Confirmation email sent",
                    desc: "Check your inbox for your full order receipt",
                    done: true,
                  },
                  {
                    icon: "🚜",
                    title: "Farm prepares your order",
                    desc: "Harvested fresh on the morning of delivery",
                    done: false,
                  },
                  {
                    icon: "📦",
                    title: "Out for delivery",
                    desc: "You'll get a notification when it's on the way",
                    done: false,
                  },
                  {
                    icon: "🌿",
                    title: "Delivered to your door",
                    desc: "Farm fresh, just as nature intended",
                    done: false,
                  },
                ].map((step, i, arr) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                          step.done ? "bg-green-pale" : "bg-[#f7f7f7]"
                        }`}
                      >
                        {step.icon}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className={`w-px flex-1 my-1 min-h-[1rem] ${
                            step.done ? "bg-green/20" : "bg-[#ebebeb]"
                          }`}
                        />
                      )}
                    </div>

                    <div
                      className={`min-w-0 ${i < arr.length - 1 ? "pb-5" : "pb-0"}`}
                    >
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          step.done ? "text-verdant-dark" : "text-verdant-muted"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-[#bbb] mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/account/orders"
              className="flex items-center justify-center gap-2 bg-green text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(45,106,79,0.28)]"
            >
              <span>📦</span>
              Track Order
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 bg-white border border-green/15 text-verdant-dark py-3.5 rounded-xl text-sm font-semibold hover:border-green hover:text-green transition-all"
            >
              <span>🛒</span>
              Keep Shopping
            </Link>
          </div>

          <p className="text-center text-xs text-verdant-muted">
            Questions?{" "}
            <a
              href="mailto:hello@verdant.com"
              className="text-green hover:underline font-medium"
            >
              hello@verdant.com
            </a>
            {" · "}
            <Link
              href="/faq"
              className="text-green hover:underline font-medium"
            >
              FAQ
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
