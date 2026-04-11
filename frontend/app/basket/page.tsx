"use client";

import CartItems from "@/components/CartItems";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import MightLike from "@/components/MightLike";
import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks";
import { getSuggested } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Leaf,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    subtotalFormatted,
    isLoading,
  } = useCart();

  const productIds = cartItems.map((i) => i.productId);

  const { data: suggested } = useQuery({
    queryKey: ["suggested", productIds],
    queryFn: async () => getSuggested(productIds),
    enabled: productIds.length > 0,
  });

  const handleRemoveItem = async (id: string) => {
    removeItem(id);
    toast.success("Item removed");
  };

  if (isLoading) {
    return (
      <div className="bg-cream min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 pt-24 pb-20">
          <Container>
            <div className="mb-8 md:mb-12 border-b border-gray-200 pb-6">
              <div className="w-32 h-4 bg-gray-200 rounded-md mb-4 animate-pulse" />
              <div className="w-48 h-10 md:h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded-md mt-4 animate-pulse" />
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="w-full lg:col-span-7 xl:col-span-8">
                <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-center border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="w-2/3 h-5 bg-gray-200 rounded-md animate-pulse" />
                        <div className="w-1/3 h-4 bg-gray-200 rounded-md animate-pulse" />
                      </div>
                      <div className="hidden sm:block w-24 h-12 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
                <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-6 border-b border-gray-50">
                    <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse" />
                  </div>

                  <div className="px-6 py-6 flex flex-col gap-4 bg-gray-50/30 border-b border-gray-100">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <div className="w-1/2 h-4 bg-gray-200 rounded-md animate-pulse" />
                        <div className="w-12 h-4 bg-gray-200 rounded-md animate-pulse" />
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-6 bg-white/80">
                    <div className="flex justify-between items-end mb-6">
                      <div className="w-20 h-6 bg-gray-200 rounded-md animate-pulse" />
                      <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse" />
                    </div>

                    <div className="w-full h-14 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/80 rounded-xl h-24 border border-gray-100 shadow-sm animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <Container>
          <div className="mb-8 md:mb-12 border-b border-gray-200 pb-6">
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-green mb-3">
              Your Selection
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-playfair font-black text-verdant-dark text-3xl md:text-4xl lg:text-5xl">
                  Basket
                </h1>
                <p className="text-verdant-muted mt-2 text-sm font-medium">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-4 bg-white/80 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-green/5 rounded-full flex items-center justify-center mb-6 border border-green/10">
                <ShoppingBag className="w-8 h-8 text-green" />
              </div>
              <h2 className="font-playfair font-bold text-verdant-dark text-2xl md:text-3xl mb-3">
                Your basket is empty
              </h2>
              <p className="text-gray-500 max-w-sm mb-8 font-medium">
                Looks like you haven&apos;t added anything yet. Let&apos;s find
                some fresh produce for you.
              </p>
              <Link
                href="/shop"
                className="bg-green text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-mid transition-colors flex items-center gap-2"
              >
                Browse Produce <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="w-full lg:col-span-7 xl:col-span-8">
                <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                  <CartItems
                    items={cartItems}
                    handleRemoveItem={handleRemoveItem}
                    handleUpdateQuantity={updateQuantity}
                  />
                </div>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 mt-6 text-verdant-muted hover:text-green text-sm font-bold transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>

              <div className="w-full lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
                <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-gray-50">
                    <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                      Order Summary
                    </h2>
                  </div>

                  <div className="px-6 py-4 flex flex-col gap-3 max-h-[240px] overflow-y-auto custom-scrollbar bg-gray-50/30">
                    {cartItems.map((p) => (
                      <div
                        key={p.slug}
                        className="flex justify-between items-center text-sm gap-4"
                      >
                        <span className="text-gray-600 font-medium truncate flex-1">
                          {p.name}
                          <span className="ml-2 text-gray-400 text-xs font-bold">
                            ×{p.quantity}
                          </span>
                        </span>
                        <span className="font-bold text-verdant-dark flex-shrink-0">
                          £{((p.pricePence / 100) * p.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-6 border-t border-gray-100 bg-white/80">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-gray-600 font-bold text-base">
                        Subtotal
                      </span>
                      <span className="font-playfair font-black text-green text-2xl leading-none">
                        £{subtotalFormatted}
                      </span>
                    </div>

                    <Link
                      href="/checkout"
                      className="flex items-center justify-center gap-2 w-full bg-green text-white py-4 rounded-xl font-bold hover:bg-green-mid transition-all shadow-sm"
                    >
                      Proceed to Checkout <ArrowRight size={18} />
                    </Link>

                    <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={14} /> Secure
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Leaf size={14} /> Fresh
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: Leaf, label: "Organic" },
                    { icon: RefreshCcw, label: "Eco-packed" },
                    { icon: ShieldCheck, label: "Guarantee" },
                  ].map((Badge, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm"
                    >
                      <Badge.icon
                        className="w-5 h-5 text-green mb-2"
                        strokeWidth={2.5}
                      />
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {Badge.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-16">
              <MightLike suggested={suggested ?? []} />
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
