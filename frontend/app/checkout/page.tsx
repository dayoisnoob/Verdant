"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks";
import {
  addUserAddress,
  createCheckoutSession,
  getCartTotal,
  getUserAddress,
} from "@/lib/api";
import { useAuthStore } from "@/store/store";
import { ApiError } from "@/util";
import { CheckoutForm, checkoutSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT — Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { items: cartItems, couponCode } = useCart();

  const { data: cart } = useQuery({
    queryKey: ["cartTotal", couponCode],
    queryFn: async () => {
      const res = await getCartTotal(couponCode);
      return res.data;
    },
  });

  const hydrated = useAuthStore.persist.hasHydrated();

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push("/login?redirect=/checkout");
    }
  }, [hydrated, isLoggedIn, router]);

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await getUserAddress();
      return res.data;
    },
  });

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [showNewForm, setShowNewForm] = useState(false);
  const shouldShowForm = showNewForm || addresses.length === 0;

  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const selectedAddressId = manualSelection ?? defaultAddress?.id ?? null;

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  if (!hydrated || !isLoggedIn) return null;

  if (!cart) return null;

  const subtotal = Number((cart?.subtotalPence / 100).toFixed(2));
  const discount = Number((cart?.discountPence / 100).toFixed(2));
  const shippingFee = Number((cart?.deliveryPence / 100).toFixed(2));
  const total = Number((cart?.totalPence / 100).toFixed(2));

  // const discountedSubtotal = Number(subtotal) - discount;
  // const { shippingFee, totalAmount } = calculateOrderTotal(discountedSubtotal);

  const proceedToPayment = async (
    addressId: string,
    deliveryNotes?: string,
  ) => {
    const items = cartItems.map((i) => ({
      name: i.name,
      price: i.pricePence,
      quantity: i.quantity,
      image: i.imageUrl,
      productId: i.productId,
    }));

    console.log(items);

    const { data: checkoutData } = await createCheckoutSession({
      items,
      shippingFee,
      addressId,
      discount,
      couponCode,
      deliveryNotes,
    });

    router.push(checkoutData.url);
  };

  const onContinueWithSavedAddress = async () => {
    const deliveryNotes = getValues("deliveryNotes");
    await proceedToPayment(selectedAddressId!, deliveryNotes);
  };

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const newAddress = await addUserAddress({
        firstName: user!.firstName,
        lastName: user!.lastName,
        streetAddress: data.streetAddress,
        phone1: data.phone1,
        phone2: data.phone2,
        state: data.state,
      });

      await proceedToPayment(newAddress.data.id, data.deliveryNotes);
    } catch (err) {
      console.error("checkout error:", err); // add this

      if (err instanceof ApiError && err.errors) {
        for (const { field, message } of err.errors) {
          setError(field as keyof CheckoutForm, { message });
        }
      }
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-16 md:pt-24 bg-cream min-h-screen">
        {/* ── Header ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-4 md:py-8 border-b border-green/10">
          {/* Mobile */}
          <div className="flex items-center justify-between md:hidden">
            <Link
              href="/"
              className="font-playfair text-xl font-black text-green"
            >
              Ver<em className="not-italic text-green-light">dant</em>
            </Link>
            <Link
              href="/basket"
              className="text-sm text-verdant-muted hover:text-green transition-colors"
            >
              ← Basket
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between">
            <Link
              href="/"
              className="font-playfair text-2xl font-black text-green"
            >
              Ver<em className="not-italic text-green-light">dant</em>
            </Link>

            <Link
              href="/basket"
              className="text-sm text-verdant-muted hover:text-green transition-colors flex items-center gap-1.5"
            >
              ← Back to basket
            </Link>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 py-6 md:py-12 flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-14 items-start">
          {/* ── Left — Address section ── */}
          <div className="flex flex-col gap-5 md:gap-8 w-full">
            {shouldShowForm ? (
              /* ── New Address Form ── */
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5 md:gap-8"
              >
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-5 md:px-7 py-4 md:py-5 border-b border-[#f0f0f0] flex items-center justify-between">
                    <h2 className="font-playfair font-bold text-verdant-dark text-lg md:text-xl">
                      Delivery Address
                    </h2>
                    {/* Only show if they have saved addresses to go back to */}
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewForm(false)}
                        className="text-xs text-green hover:underline font-medium"
                      >
                        ← Use saved address
                      </button>
                    )}
                  </div>

                  <div className="px-5 md:px-7 py-5 md:py-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-verdant-dark uppercase tracking-wider">
                        Street Address
                      </label>
                      <input
                        {...register("streetAddress")}
                        type="text"
                        placeholder="Enter your address"
                        className="border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark placeholder:text-[#ccc]"
                      />
                      {errors.streetAddress && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.streetAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-verdant-dark uppercase tracking-wider">
                          Phone Number
                        </label>
                        <div className="flex border border-[#e5e5e5] rounded-xl overflow-hidden focus-within:border-green focus-within:ring-2 focus-within:ring-green/10 transition-all bg-white">
                          <span className="flex items-center px-3 text-sm text-[#aaa] bg-[#fafafa] border-r border-[#e5e5e5] flex-shrink-0 whitespace-nowrap">
                            +234
                          </span>
                          <input
                            {...register("phone1")}
                            type="tel"
                            placeholder="080 0000 0000"
                            className="flex-1 min-w-0 px-3 py-3 text-sm outline-none bg-transparent text-verdant-dark placeholder:text-[#ccc]"
                          />
                        </div>
                        {/* Error is outside the flex wrapper so it sits on its own line */}
                        {errors.phone1 && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.phone1.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-verdant-dark uppercase tracking-wider">
                          Phone 2{" "}
                          <span className="text-[#ccc] normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="flex border border-[#e5e5e5] rounded-xl overflow-hidden focus-within:border-green focus-within:ring-2 focus-within:ring-green/10 transition-all bg-white">
                          <span className="flex items-center px-3 text-sm text-[#aaa] bg-[#fafafa] border-r border-[#e5e5e5] flex-shrink-0 whitespace-nowrap">
                            +234
                          </span>
                          <input
                            {...register("phone2")}
                            type="tel"
                            placeholder="070 0000 0000"
                            className="flex-1 min-w-0 px-3 py-3 text-sm outline-none bg-transparent text-verdant-dark placeholder:text-[#ccc]"
                          />
                        </div>
                        {errors.phone2 && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.phone2.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-verdant-dark uppercase tracking-wider">
                        State / Region
                      </label>
                      <div className="relative">
                        <select
                          {...register("state")}
                          defaultValue=""
                          className="w-full appearance-none border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10 transition-all bg-white text-verdant-dark cursor-pointer pr-10"
                        >
                          <option value="" hidden>
                            Select your state
                          </option>
                          {NIGERIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                      {errors.state && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DeliveryNotes register={register} />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green text-white py-4 rounded-full font-semibold text-base hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  {isSubmitting ? "Saving address..." : "Continue to Payment →"}
                </button>
              </form>
            ) : (
              /* ── Saved Addresses ── */
              <div className="flex flex-col gap-5 md:gap-8">
                <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
                  <div className="px-5 md:px-7 py-4 md:py-5 border-b border-[#f0f0f0] flex items-center justify-between">
                    <div>
                      <h2 className="font-playfair font-bold text-verdant-dark text-lg md:text-xl">
                        Delivery Address
                      </h2>
                      <p className="text-xs text-verdant-muted mt-0.5">
                        Select where to deliver your order
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewForm(true)}
                      className="text-xs font-medium text-green border border-green px-4 py-2 rounded-full hover:bg-green hover:text-white transition-all duration-200 flex-shrink-0"
                    >
                      + Add new
                    </button>
                  </div>

                  <div className="px-5 md:px-7 py-5 md:py-6 flex flex-col gap-3">
                    {addresses.map((address) => {
                      const isSelected = selectedAddressId === address.id;
                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setManualSelection(address.id)}
                          className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 relative group ${
                            isSelected
                              ? "border-green bg-green-pale/40"
                              : "border-[#e5e5e5] hover:border-green/40 bg-white"
                          }`}
                        >
                          {address.isDefault && (
                            <span className="absolute top-3 right-3 text-[0.6rem] font-bold uppercase tracking-wider bg-green text-white px-2.5 py-1 rounded-full">
                              Default
                            </span>
                          )}
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected ? "border-green" : "border-[#ccc] group-hover:border-green/50"}`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-green" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                              <p className="text-sm font-semibold text-verdant-dark">
                                {address.streetAddress}
                              </p>
                              <p className="text-xs text-verdant-muted mt-1">
                                {address.state}
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-xs text-[#aaa]">
                                  📞 +234 {address.phone1}
                                </span>
                                {address.phone2 && (
                                  <>
                                    <span className="text-[#e5e5e5]">·</span>
                                    <span className="text-xs text-[#aaa]">
                                      +234 {address.phone2}
                                    </span>
                                  </>
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

                <button
                  type="button"
                  disabled={!selectedAddressId}
                  onClick={onContinueWithSavedAddress}
                  className="w-full bg-green text-white py-4 rounded-full font-semibold text-base hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,106,79,0.28)] disabled:bg-[#ccc] disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  Continue to Payment →
                </button>
              </div>
            )}
          </div>

          {/* ── Right — Order Summary ── */}
          <div className="w-full lg:sticky lg:top-28 flex flex-col gap-4 md:gap-5">
            <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
              <div className="bg-green-pale px-5 md:px-6 py-4 md:py-5 border-b border-green/10 flex items-center justify-between">
                <h2 className="font-playfair font-bold text-verdant-dark text-lg md:text-xl">
                  Your Order
                </h2>
                <Link
                  href="/basket"
                  className="text-xs text-green hover:underline font-medium"
                >
                  Edit
                </Link>
              </div>

              <div className="px-5 md:px-6 py-4 md:py-5 flex flex-col gap-3 md:gap-4">
                {cartItems.map((i) => (
                  <div key={i.slug} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={i.imageUrl}
                        alt={i.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green text-white text-[0.55rem] md:text-[0.6rem] font-bold rounded-full flex items-center justify-center">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs md:text-sm font-medium text-verdant-dark truncate">
                        {i.name}
                      </div>
                      <div className="text-xs text-verdant-muted">{i.unit}</div>
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-verdant-dark flex-shrink-0">
                      £{((i.pricePence / 100) * i.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#f0f0f0] flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-verdant-muted">Subtotal</span>
                  <span className="font-medium">£{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Discount ({couponCode.toUpperCase()})
                    </span>
                    <span className="text-green-600">
                      −£{Number(discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-verdant-muted">Delivery</span>
                  <span
                    className={`font-medium ${shippingFee === 0 ? "text-green" : ""}`}
                  >
                    {shippingFee === 0 ? "Free 🎉" : `£${shippingFee}`}
                  </span>
                </div>

                <div className="h-px bg-[#f0f0f0] my-1" />
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-verdant-dark">Total</span>
                  <div className="text-right">
                    <div className="font-playfair font-bold text-green text-xl md:text-2xl">
                      £{total}
                    </div>
                    <div className="text-[0.65rem] text-verdant-muted">
                      incl. VAT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4">
              <div className="text-2xl md:text-3xl flex-shrink-0">🌱</div>
              <div>
                <div className="font-semibold text-white text-sm">
                  Same-day harvest guarantee
                </div>
                <p className="text-white/70 text-xs leading-relaxed mt-1">
                  Order before 10am and your produce goes from field to packing
                  in hours.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-2.5">
              {[
                { icon: "🔒", text: "SSL encrypted checkout" },
                { icon: "🚜", text: "Traceable to the farm" },
                { icon: "↩️", text: "Freshness guaranteed or full refund" },
              ].map((t) => (
                <div
                  key={t.text}
                  className="flex items-center gap-3 text-xs text-verdant-muted"
                >
                  <span className="text-base">{t.icon}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function DeliveryNotes({
  register,
}: {
  register: ReturnType<typeof useForm<CheckoutForm>>["register"];
}) {
  return (
    <div className="bg-white rounded-2xl border border-green/10 overflow-hidden">
      <div className="px-5 md:px-7 py-4 md:py-5 border-b border-[#f0f0f0]">
        <h2 className="font-playfair font-bold text-verdant-dark text-lg md:text-xl">
          Delivery Notes{" "}
          <span className="text-[#ccc] text-sm md:text-base font-normal">
            (optional)
          </span>
        </h2>
      </div>
      <div className="px-5 md:px-7 py-5 md:py-6">
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
