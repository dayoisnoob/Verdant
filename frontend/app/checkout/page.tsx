"use client";

import { CheckoutSteps } from "@/components/CheckoutSteps";
import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UnavailableItemModal, {
  UnavailableItem,
} from "@/components/unavailableItemModal";
import { useCart } from "@/hooks";
import {
  addUserAddress,
  createCheckoutSession,
  getUserAddresses,
  removeCoupon,
} from "@/lib/api";
import { applyCoupon } from "@/lib/api/coupon.api";
import { FREE_SHIPPING_THRESHOLD, NIGERIAN_STATES } from "@/lib/constants";
import { ApiError } from "@/util";
import { CheckoutForm, checkoutSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Plus,
  CheckCircle2,
  LockKeyhole,
  Truck,
  BanknoteArrowDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const inputStyles =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/10 transition-all bg-gray-50/50 hover:bg-white text-verdant-dark placeholder:text-gray-400";

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
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-verdant-dark uppercase tracking-wider flex items-center gap-1.5">
        {label}
        {optional && (
          <span className="text-gray-400 normal-case font-medium tracking-normal">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

function PhoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-green focus-within:ring-4 focus-within:ring-green/10 transition-all bg-gray-50/50 hover:bg-white">
      <span className="flex items-center px-4 text-sm text-gray-500 border-r border-gray-200 flex-shrink-0 font-medium bg-gray-100/50">
        +234
      </span>
      <input
        type="tel"
        className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-transparent text-verdant-dark placeholder:text-gray-400"
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="font-bold text-verdant-dark text-lg">Delivery Notes</h3>
        <p className="text-sm text-verdant-muted mt-1">
          Help our rider find your location faster.
        </p>
      </div>
      <div className="p-6 bg-gray-50/30">
        <textarea
          {...register("deliveryNotes")}
          rows={3}
          placeholder="e.g. Call on arrival, landmark is the blue gate..."
          className={`${inputStyles} resize-none`}
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
      className="w-full bg-green text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-green-mid transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(45,106,79,0.2)] hover:shadow-[0_6px_20px_rgba(45,106,79,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Processing Securely...
        </>
      ) : (
        "Continue to Payment →"
      )}
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [isPaying, setIsPaying] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [manualSelection, setManualSelection] = useState<string | null>(null);

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const couponSuccess = couponDiscount > 0;

  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>(
    [],
  );
  const [modalMessage, setModalMessage] = useState("");

  const {
    items: cartItems,
    subtotal,
    subtotalFormatted,
    delivery,
    deliveryFormatted,
    totalFormatted,
  } = useCart(couponDiscount);

  useEffect(() => {
    if (cartItems && !cartItems.length) {
      router.push("/basket");
    }
  }, [cartItems, cartItems.length, router]);

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    refetch: refetchAddresses,
    isError: addressesError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => await getUserAddresses(),
  });

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

  if (addressesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
            <p className="text-sm font-medium text-verdant-muted tracking-wide">
              Preparing your checkout...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (addressesError) {
    return (
      <>
        <Navbar />
        <ErrorState
          message="We couldn't load your addresses. Please check your connection."
          onRetry={() => refetchAddresses()}
        />
        <Footer />
      </>
    );
  }

  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeft = ((FREE_SHIPPING_THRESHOLD - subtotal) / 100).toFixed(2);
  const hasFreeDelivery = delivery === 0;

  const proceedToPayment = async (
    addressId: string,
    deliveryNotes?: string,
  ) => {
    setIsPaying(true);
    try {
      const items = cartItems.map((i) => ({
        quantity: i.quantity,
        productId: i.productId,
      }));
      const res = await createCheckoutSession({
        items,
        addressId,
        couponCode: coupon,
        deliveryNotes,
      });

      router.push(res.url);
    } catch (err) {
      setIsPaying(false);
      throw err;
    }
  };

  function handleCheckoutError(err: unknown) {
    const error = err as ApiError;

    if (error.statusCode === 409 && error.details) {
      setUnavailableItems(error.details);
      setModalMessage(error.message);
    } else if (error.errors) {
      for (const { field, message } of error.errors) {
        setError(field as keyof CheckoutForm, { message });
      }
    } else {
      toast.error(error.message || "Something went wrong");
    }
  }

  const onContinueWithSaved = async () => {
    if (!selectedAddressId) return;
    try {
      await proceedToPayment(selectedAddressId, getValues("deliveryNotes"));
    } catch (err) {
      handleCheckoutError(err);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
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
      handleCheckoutError(err);
    }
  };

  const handleCoupon = async () => {
    setCouponError("");
    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      const res = await applyCoupon(coupon, subtotal);
      setCouponDiscount(res.discount);
    } catch (err) {
      setCouponError(
        err instanceof ApiError
          ? err.message
          : "Invalid coupon. Please try again.",
      );
    }
  };

  const handleCouponInput = (e: ChangeEvent<HTMLInputElement>) => {
    setCouponError("");
    setCoupon(e.target.value.toUpperCase());
  };

  const handleRemoveCoupon = async (errMsg?: string) => {
    await removeCoupon();
    setCoupon("");
    setCouponError(errMsg || "");
    setCouponDiscount(0);
  };

  const isProcessing = isSubmitting || isPaying;

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <Container>
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="font-playfair text-2xl md:text-3xl font-black text-green"
              >
                Ver<em className="not-italic text-green-light">dant</em>
              </Link>
              <Link
                href="/basket"
                className="text-sm font-medium text-verdant-muted hover:text-green transition-colors flex items-center gap-2"
              >
                ← Return to Basket
              </Link>
            </div>
            <CheckoutSteps active={1} />
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="w-full lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              {shouldShowForm ? (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
                      <div>
                        <h2 className="font-playfair font-bold text-verdant-dark text-xl md:text-2xl">
                          Delivery Details
                        </h2>
                        <p className="text-sm text-verdant-muted mt-1">
                          Where should we send your order?
                        </p>
                      </div>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewForm(false)}
                          className="text-xs font-bold text-green bg-green/5 px-4 py-2 rounded-lg hover:bg-green/10 transition-colors"
                        >
                          Use Saved Address
                        </button>
                      )}
                    </div>

                    <div className="p-6 bg-gray-50/30 flex flex-col gap-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field
                          label="First Name"
                          error={errors.firstName?.message}
                        >
                          <input
                            {...register("firstName")}
                            type="text"
                            placeholder="Jane"
                            className={inputStyles}
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
                            className={inputStyles}
                          />
                        </Field>
                      </div>

                      <Field
                        label="Street Address"
                        error={errors.streetAddress?.message}
                      >
                        <input
                          {...register("streetAddress")}
                          type="text"
                          placeholder="12 Bode Thomas Street, Surulere"
                          className={inputStyles}
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field
                          label="Primary Phone"
                          error={errors.phone1?.message}
                        >
                          <PhoneInput
                            {...register("phone1")}
                            placeholder="080 0000 0000"
                          />
                        </Field>
                        <Field
                          label="Alternative Phone"
                          optional
                          error={errors.phone2?.message}
                        >
                          <PhoneInput
                            {...register("phone2")}
                            placeholder="070 0000 0000"
                          />
                        </Field>
                      </div>

                      <Field
                        label="State / Region"
                        error={errors.state?.message}
                      >
                        <div className="relative">
                          <select
                            {...register("state")}
                            defaultValue=""
                            className={`${inputStyles} cursor-pointer appearance-none pr-10`}
                          >
                            <option value="" disabled hidden>
                              Select your state
                            </option>
                            {NIGERIAN_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
                      </Field>
                    </div>
                  </div>

                  <DeliveryNotes register={register} />

                  <div className="hidden lg:block">
                    <PayButton loading={isProcessing} />
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                      <div>
                        <h2 className="font-playfair font-bold text-verdant-dark text-xl md:text-2xl">
                          Select Address
                        </h2>
                        <p className="text-sm text-verdant-muted mt-1">
                          Choose a saved delivery location
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewForm(true)}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-green px-4 py-2.5 rounded-xl hover:bg-green-mid transition-all shadow-sm"
                      >
                        <Plus size={16} strokeWidth={3} />
                        Add New
                      </button>
                    </div>

                    <div className="p-6 bg-gray-50/30 flex flex-col gap-4">
                      {addresses.map((address) => {
                        const isSelected = selectedAddressId === address.id;
                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => setManualSelection(address.id)}
                            className={`relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200 group ${
                              isSelected
                                ? "border-green bg-green/5 shadow-[0_0_0_4px_rgba(45,106,79,0.05)]"
                                : "border-gray-200 bg-white hover:border-green/40 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  isSelected
                                    ? "border-green bg-green"
                                    : "border-gray-300 group-hover:border-green/50"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                  <p className="text-base font-bold text-verdant-dark">
                                    {address.streetAddress}
                                  </p>
                                  {address.isDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2.5 py-1 rounded-md">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1.5 mt-2">
                                  <p className="text-sm text-gray-600 font-medium">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                    <MapPin
                                      size={14}
                                      className="text-gray-400"
                                    />
                                    {address.state}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    +234 {address.phone1}
                                    {address.phone2 &&
                                      ` • +234 ${address.phone2}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <DeliveryNotes register={register} />

                  <div className="hidden lg:block">
                    <PayButton
                      type="button"
                      loading={isProcessing}
                      disabled={!selectedAddressId || isProcessing}
                      onClick={onContinueWithSaved}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
                  <h2 className="font-playfair font-bold text-verdant-dark text-xl">
                    Order Summary
                  </h2>
                  <Link
                    href="/basket"
                    className="text-sm text-green hover:underline font-bold"
                  >
                    Edit Cart
                  </Link>
                </div>

                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-verdant-dark">
                      {hasFreeDelivery
                        ? "Free delivery unlocked! 🎉"
                        : "Almost there..."}
                    </span>
                    {!hasFreeDelivery && (
                      <span
                        className={`text-sm font-bold ${
                          hasFreeDelivery ? "text-green" : "text-gray-500"
                        }`}
                      >
                        £{(subtotal / 100).toFixed(2)} / £
                        {(FREE_SHIPPING_THRESHOLD / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        delivery <= 0 ? "bg-green" : "bg-green-light"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  {delivery > 0 && (
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Add £{amountLeft} more to your cart to unlock free
                      delivery.
                    </p>
                  )}
                </div>

                <div className="px-6 py-5 border-b border-gray-50">
                  <div
                    className={`flex rounded-xl overflow-hidden border-2 transition-all bg-gray-50/50 ${
                      couponError
                        ? "border-red-200 focus-within:border-red-400"
                        : couponSuccess
                          ? "border-green/30 bg-green/5"
                          : "border-gray-200 focus-within:border-green"
                    }`}
                  >
                    <input
                      type="text"
                      value={coupon}
                      onChange={handleCouponInput}
                      disabled={!!couponDiscount}
                      placeholder="Promo code"
                      className="flex-1 bg-transparent outline-none px-4 py-3 text-sm font-bold text-verdant-dark placeholder:text-gray-400 disabled:opacity-60 uppercase tracking-wider"
                    />
                    {couponSuccess ? (
                      <button
                        onClick={() => handleRemoveCoupon()}
                        className="px-5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleCoupon}
                        disabled={!coupon.trim()}
                        className="px-5 text-xs font-bold text-green hover:bg-green/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-green mt-2 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Coupon applied successfully
                    </p>
                  )}
                </div>

                <div className="px-6 py-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-4 py-4">
                    {cartItems.map((i) => (
                      <div key={i.slug} className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                          <Image
                            src={i.imageUrl}
                            alt={i.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-verdant-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {i.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-verdant-dark truncate">
                            {i.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {i.unit}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-verdant-dark flex-shrink-0">
                          £{((i.pricePence / 100) * i.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-bold text-verdant-dark">
                      £{subtotalFormatted}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green font-bold">
                        Discount ({coupon.toUpperCase()})
                      </span>
                      <span className="text-green font-bold">
                        −£{(couponDiscount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Delivery</span>
                    <span
                      className={`font-bold ${
                        delivery === 0 ? "text-green" : "text-verdant-dark"
                      }`}
                    >
                      {delivery === 0 ? "Free 🎉" : `£${deliveryFormatted}`}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-verdant-dark text-base">
                      Total
                    </span>
                    <div className="text-right">
                      <p className="font-playfair font-black text-green text-3xl leading-none">
                        £{totalFormatted}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1"></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-2 mt-2">
                {[
                  {
                    icon: <LockKeyhole size={16} color="green" />,
                    text: "Secure, SSL-encrypted checkout",
                  },
                  {
                    icon: <Truck size={16} color="orange" />,
                    text: "100% traceable to the source",
                  },
                  {
                    icon: <BanknoteArrowDown size={16} color="blue" />,
                    text: "Freshness guaranteed or full refund",
                  },
                ].map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center gap-3 text-sm text-gray-600 font-medium"
                  >
                    <span className="text-lg">{t.icon}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-50 pb-safe">
        <PayButton
          type="button"
          loading={isProcessing}
          disabled={
            isProcessing || (shouldShowForm ? false : !selectedAddressId)
          }
          onClick={() => {
            if (shouldShowForm) {
              handleSubmit(onSubmit)();
            } else {
              onContinueWithSaved();
            }
          }}
        />
      </div>

      <UnavailableItemModal
        isOpen={unavailableItems.length > 0}
        onClose={() => setUnavailableItems([])}
        items={unavailableItems}
        message={modalMessage}
      />

      <Footer />
    </div>
  );
}
