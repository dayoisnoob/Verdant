"use client";

import { CheckoutSteps } from "@/components/CheckoutSteps";
import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks";
import {
  addUserAddress,
  createCheckoutSession,
  getCartTotal,
  getUserAddresses,
} from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/constants";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { CheckoutForm, checkoutSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-verdant-dark uppercase tracking-wider flex items-center gap-1.5">
        {label}
        {optional && (
          <span className="text-[#bbb] normal-case font-normal text-[0.7rem]">
            optional
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function PhoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex border border-[#e5e5e5] rounded-xl overflow-hidden focus-within:border-green focus-within:ring-2 focus-within:ring-green/10 transition-all bg-white">
      <span className="flex items-center px-3 text-sm text-[#aaa] bg-[#fafafa] border-r border-[#e5e5e5] flex-shrink-0 font-mono tracking-tight">
        +234
      </span>
      <input
        type="tel"
        className="flex-1 min-w-0 px-3 py-3 text-sm outline-none bg-transparent text-verdant-dark placeholder:text-[#ccc]"
        {...props}
      />
    </div>
  );
}

function DeliveryNotes({
  register,
}: {
  register: ReturnType<typeof useForm<CheckoutForm>>["register"];
}) {
  return (
    <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0f0f0]">
        <h3 className="font-semibold text-verdant-dark text-base">
          Delivery Notes
          <span className="ml-2 text-[#bbb] text-sm font-normal">optional</span>
        </h3>
        <p className="text-xs text-verdant-muted mt-0.5">
          Help our rider find you faster
        </p>
      </div>
      <div className="px-6 py-5">
        <textarea
          {...register("deliveryNotes")}
          rows={3}
          placeholder="e.g. Call on arrival, leave with security, landmark is the blue gate..."
          className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc] resize-none"
        />
      </div>
    </div>
  );
}

function PayButton({
  loading,
  disabled,
  onClick,
  type = "submit",
}: {
  loading: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full bg-green text-white py-4 rounded-full font-semibold text-base flex items-center justify-center gap-2.5 hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
    >
      {loading ? (
        <>
          <Loader2 size={17} className="animate-spin" />
          Redirecting to payment…
        </>
      ) : (
        "Continue to Payment →"
      )}
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const hydrated = useAuthStore.persist.hasHydrated();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const { items: cartItems, couponCode, isLoading, cartError } = useCart();

  if (!isLoading && cartItems.length === 0) redirect("/basket");

  const [isPaying, setIsPaying] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [manualSelection, setManualSelection] = useState<string | null>(null);

  const {
    data: cart,
    isLoading: totalsLoading,
    refetch: refetchTotals,
  } = useQuery({
    queryKey: ["cartTotal", couponCode],
    queryFn: getCartTotal,
  });

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    refetch: refetchAddresses,
    isError: addressesError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => await getUserAddresses(),
  });

  useEffect(() => {
    if (hydrated && !isLoggedIn) redirect("/login?redirect=/checkout");
  }, [hydrated, isLoggedIn, router]);

  const shouldShowForm = showNewForm || addresses.length === 0;
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const selectedAddressId = manualSelection ?? defaultAddress?.id ?? null;

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  if (!hydrated || !isLoggedIn || !cart) return null;

  if (isLoading || totalsLoading || addressesLoading) {
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

  if (cartError || addressesError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="Check your connection and try again."
          onRetry={() => {
            refetchTotals();
            refetchAddresses();
          }}
        />
        <Footer />
      </>
    );
  }

  const subtotal = Number((cart.subtotalPence / 100).toFixed(2));
  const discount = Number((cart.discountPence / 100).toFixed(2));
  const shippingFee = Number((cart.deliveryPence / 100).toFixed(2));
  const total = Number((cart.totalPence / 100).toFixed(2));

  const proceedToPayment = async (
    addressId: string,
    deliveryNotes?: string,
  ) => {
    setIsPaying(true);
    try {
      const items = cartItems.map((i) => ({
        name: i.name,
        price: i.pricePence / 100,
        quantity: i.quantity,
        image: i.imageUrl,
        productId: i.productId,
      }));
      console.log(items);
      const res = await createCheckoutSession({
        items,
        shippingFee,
        addressId,
        discount,
        couponCode,
        deliveryNotes,
      });

      router.push(res.url);
    } catch (err) {
      setIsPaying(false);
      throw err;
    }
  };

  const onContinueWithSaved = async () => {
    await proceedToPayment(selectedAddressId!, getValues("deliveryNotes"));
  };

  const onSubmit = async (data: CheckoutForm) => {
    console.log("submitting");
    try {
      const newAddress = await addUserAddress({
        firstName: data.firstName,
        lastName: data.lastName,
        streetAddress: data.streetAddress,
        phone1: data.phone1,
        phone2: data.phone2,
        state: data.state,
      });
      await proceedToPayment(newAddress.id, data.deliveryNotes);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setError(field as keyof CheckoutForm, { message });
        }
      }
    }
  };

  const isProcessing = isSubmitting || isPaying;

  return (
    <Container>
      <Navbar />

      <main className="pt-16 md:pt-24 bg-cream min-h-screen pb-16">
        {/* ── Header ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-4 md:py-6 border-b border-green/10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-playfair text-xl md:text-2xl font-black text-green"
            >
              Ver<em className="not-italic text-green-light">dant</em>
            </Link>
            <Link
              href="/basket"
              className="text-sm text-verdant-muted hover:text-green transition-colors"
            >
              ← Back to basket
            </Link>
          </div>

          {/* Step indicator */}
          <CheckoutSteps active={1} />
        </div>

        {/* ── Main grid ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-6 md:py-10 flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-12 items-start">
          {/* ── Left — address + notes + CTA ── */}
          <div className="flex flex-col gap-5 w-full">
            {shouldShowForm ? (
              /* ── New address form ── */
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
                    <div>
                      <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                        Delivery Address
                      </h2>
                      <p className="text-xs text-verdant-muted mt-0.5">
                        Where should we deliver?
                      </p>
                    </div>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewForm(false)}
                        className="text-xs font-medium text-green border border-green/25 px-3.5 py-1.5 rounded-full hover:bg-green-pale transition-colors"
                      >
                        ← Saved addresses
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="First Name" error={errors.firstName?.message}>
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="Jane"
                        className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                      />
                    </Field>
                    <Field
                      label="Last Name"
                      optional
                      error={errors.lastName?.message}
                    >
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Doe"
                        className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                      />
                    </Field>
                  </div>

                  <div className="px-6 py-6 flex flex-col gap-5">
                    <Field
                      label="Street Address"
                      error={errors.streetAddress?.message}
                    >
                      <input
                        {...register("streetAddress")}
                        type="text"
                        placeholder="12 Bode Thomas Street, Surulere"
                        className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label="Phone Number"
                        error={errors.phone1?.message}
                      >
                        <PhoneInput
                          {...register("phone1")}
                          placeholder="080 0000 0000"
                        />
                      </Field>
                      <Field
                        label="Phone 2"
                        optional
                        error={errors.phone2?.message}
                      >
                        <PhoneInput
                          {...register("phone2")}
                          placeholder="070 0000 0000"
                        />
                      </Field>
                    </div>

                    <Field label="State / Region" error={errors.state?.message}>
                      <div className="relative">
                        <select
                          {...register("state")}
                          defaultValue=""
                          className="w-full appearance-none border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark cursor-pointer pr-10"
                        >
                          <option value="" hidden>
                            Select your state
                          </option>
                          {NIGERIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa]"
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                <DeliveryNotes register={register} />
                <PayButton loading={isProcessing} />
              </form>
            ) : (
              /* ── Saved addresses ── */
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
                    <div>
                      <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                        Delivery Address
                      </h2>
                      <p className="text-xs text-verdant-muted mt-0.5">
                        Select where to deliver
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewForm(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green border border-green/25 px-3.5 py-2 rounded-full hover:bg-green hover:text-white hover:border-green transition-all duration-200"
                    >
                      <Plus size={11} />
                      Add new
                    </button>
                  </div>

                  <div className="px-6 py-5 flex flex-col gap-3">
                    {addresses.map((address) => {
                      const isSelected = selectedAddressId === address.id;
                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setManualSelection(address.id)}
                          className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-200 ${
                            isSelected
                              ? "border-green bg-green-pale/25"
                              : "border-[#ebebeb] hover:border-green/30 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Radio */}
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                isSelected ? "border-green" : "border-[#ccc]"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-green" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-verdant-dark">
                                  {address.streetAddress}
                                </p>
                                {address.isDefault && (
                                  <span className="text-[0.58rem] font-bold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-verdant-dark flex items-center gap-1 mt-0.5">
                                To: {address.firstName} {address.lastName}
                              </p>
                              <p className="text-xs text-verdant-muted flex items-center gap-1 mt-0.5">
                                <MapPin size={10} className="flex-shrink-0" />
                                {address.state}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-xs text-[#aaa]">
                                  📞 +234 {address.phone1}
                                </span>
                                {address.phone2 && (
                                  <span className="text-xs text-[#aaa]">
                                    · +234 {address.phone2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <DeliveryNotes register={register} />

                <PayButton
                  type="button"
                  loading={isProcessing}
                  disabled={!selectedAddressId || isProcessing}
                  onClick={onContinueWithSaved}
                />
              </div>
            )}
          </div>

          {/* ── Right — order summary ── */}
          <div className="w-full lg:sticky lg:top-28 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between">
                <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                  Your Order
                </h2>
                <Link
                  href="/basket"
                  className="text-xs text-green hover:underline font-medium"
                >
                  Edit
                </Link>
              </div>

              {/* Items */}
              <div className="px-6 py-5 flex flex-col gap-3.5 max-h-56 overflow-y-auto">
                {cartItems.map((i) => (
                  <div key={i.slug} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={i.imageUrl}
                        alt={i.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green text-white text-[0.5rem] font-bold rounded-full flex items-center justify-center">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-verdant-dark truncate">
                        {i.name}
                      </p>
                      <p className="text-xs text-verdant-muted">{i.unit}</p>
                    </div>
                    <p className="text-sm font-semibold text-verdant-dark flex-shrink-0">
                      £{((i.pricePence / 100) * i.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-5 border-t border-[#f0f0f0] flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-verdant-muted">Subtotal</span>
                  <span className="font-medium text-verdant-dark">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green">
                      Discount ({couponCode.toUpperCase()})
                    </span>
                    <span className="text-green font-medium">
                      −£{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-verdant-muted">Delivery</span>
                  <span
                    className={`font-medium ${shippingFee === 0 ? "text-green" : "text-verdant-dark"}`}
                  >
                    {shippingFee === 0
                      ? "Free 🎉"
                      : `£${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="h-px bg-[#f0f0f0] my-0.5" />
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-verdant-dark">Total</span>
                  <div className="text-right">
                    <p className="font-playfair font-bold text-green text-2xl">
                      £{total.toFixed(2)}
                    </p>
                    <p className="text-[0.62rem] text-verdant-muted">
                      incl. VAT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div className="flex flex-col gap-2.5 px-1">
              {[
                { icon: "🔒", text: "SSL encrypted checkout" },
                { icon: "🚜", text: "Traceable to the farm" },
                { icon: "↩️", text: "Freshness guaranteed or full refund" },
              ].map((t) => (
                <div
                  key={t.text}
                  className="flex items-center gap-3 text-xs text-verdant-muted"
                >
                  <span>{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
