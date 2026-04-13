"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import AddressModal from "@/components/AddressModal";
import BlurImage from "@/components/BlurImage";
import CheckoutAddressListModal from "@/components/CheckoutAddressListModal";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import Container from "@/components/Container";
import { ErrorState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AddressSkeleton } from "@/components/Skeletons";
import { TrustBadges } from "@/components/TrustBadges";
import UnavailableItemModal, {
  UnavailableItem,
} from "@/components/unavailableItemModal";
import { useCart } from "@/hooks";
import {
  createCheckoutSession,
  getUserAddresses,
  removeCoupon,
} from "@/lib/api";
import { applyCoupon } from "@/lib/api/coupon.api";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { ApiError } from "@/util";
import DeliveryNotes from "@/components/DeliveryNotes";

export default function CheckoutPage() {
  const router = useRouter();

  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isAddressListModalOpen, setIsAddressListModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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
    isLoading,
    isHydrated,
  } = useCart(couponDiscount);

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    isError: addressesError,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: getUserAddresses,
  });

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const selectedAddressId = manualSelection ?? defaultAddress?.id ?? null;
  const currentAddress =
    addresses.find((a) => a.id === selectedAddressId) || defaultAddress;

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) router.push("/basket");
  }, [isLoading, cartItems.length, router]);

  useEffect(() => {
    if (!addressesLoading && addresses.length === 0)
      setIsAddressModalOpen(true);
  }, [addressesLoading, addresses.length]);

  const handleCheckoutError = (err: unknown) => {
    const error = err as ApiError;
    if (error.statusCode === 409 && error.details) {
      setUnavailableItems(error.details);
      setModalMessage(error.message);
    } else {
      toast.error(error.message || "Something went wrong");
    }
  };

  const onContinueToPayment = async () => {
    if (!selectedAddressId) return;
    setIsPaying(true);
    try {
      const res = await createCheckoutSession({
        addressId: selectedAddressId,
        couponCode: coupon,
        deliveryNotes,
      });
      router.push(res.url);
    } catch (err) {
      setIsPaying(false);
      handleCheckoutError(err);
    }
  };

  const handleCoupon = async () => {
    setCouponError("");
    if (!coupon.trim()) return setCouponError("Please enter a coupon code");
    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(coupon, subtotal);
      setCouponDiscount(res.discount);
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : "Invalid coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCoupon("");
    setCouponError("");
    setCouponDiscount(0);
  };

  if (addressesError)
    return (
      <ErrorState
        message="Couldn't load addresses"
        onRetry={refetchAddresses}
      />
    );

  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountLeft = ((FREE_SHIPPING_THRESHOLD - subtotal) / 100).toFixed(2);
  const hasFreeDelivery = delivery === 0;

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-32 lg:pb-20">
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
                className="text-sm font-medium text-verdant-muted hover:text-green transition-colors"
              >
                ← Return to Basket
              </Link>
            </div>
            <CheckoutSteps active={1} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              <div className="bg-white/85 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="font-playfair font-bold text-verdant-dark text-xl md:text-2xl">
                      Delivery Address
                    </h2>
                    <p className="text-sm text-verdant-muted mt-1">
                      Where should we send your order?
                    </p>
                  </div>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setIsAddressListModalOpen(true)}
                      className="text-sm font-bold text-green bg-green/10 px-4 py-2 rounded-xl hover:bg-green/20 transition-all"
                    >
                      Change
                    </button>
                  )}
                </div>

                <div className="p-6 bg-gray-50/30">
                  {addressesLoading ? (
                    <AddressSkeleton />
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                      <MapPin
                        size={32}
                        className="mx-auto text-gray-300 mb-3"
                      />
                      <p className="font-bold text-verdant-dark mb-1">
                        No saved addresses
                      </p>
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-sm font-bold text-green hover:underline mt-2"
                      >
                        + Add your first address
                      </button>
                    </div>
                  ) : currentAddress ? (
                    <div className="bg-green/10 border-2 border-green/30 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin size={18} className="text-green" />
                        <p className="font-bold text-verdant-dark text-lg">
                          {currentAddress.streetAddress}
                        </p>
                        {currentAddress.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-green/10 text-green px-2 py-1 rounded-md ml-auto">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="ml-7 space-y-1">
                        <p className="text-sm text-gray-600 font-medium">
                          {currentAddress.firstName} {currentAddress.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentAddress.state} • {currentAddress.phone1}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <DeliveryNotes
                deliveryNotes={deliveryNotes}
                setDeliveryNotes={setDeliveryNotes}
              />

              <div className="hidden lg:block">
                <button
                  disabled={!selectedAddressId || isPaying || !isHydrated}
                  onClick={onContinueToPayment}
                  className="w-full bg-green text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-green-mid transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPaying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    "Continue to Payment →"
                  )}
                </button>
              </div>
            </div>

            <div className="w-full lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
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
                  <div className="flex justify-between mb-2">
                    {!isHydrated ? (
                      <>
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-verdant-dark">
                          {hasFreeDelivery
                            ? "Free delivery unlocked! 🎉"
                            : "Almost there..."}
                        </span>
                        {!hasFreeDelivery && (
                          <span className="text-sm font-bold text-gray-500">
                            £{(subtotal / 100).toFixed(2)} / £
                            {(FREE_SHIPPING_THRESHOLD / 100).toFixed(2)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {!isHydrated ? (
                    <div className="h-2 bg-gray-200 rounded-full animate-pulse mt-3" />
                  ) : (
                    <>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                        <div
                          className={`h-full rounded-full transition-all ${delivery <= 0 ? "bg-green" : "bg-green-light"}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {delivery > 0 && (
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          Add £{amountLeft} more for free delivery.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="px-6 py-5 border-b border-gray-50">
                  <div
                    className={`flex rounded-xl overflow-hidden border-2 transition-all bg-gray-50/50 ${couponError ? "border-red-200" : couponSuccess ? "border-green/30 bg-green/5" : "border-gray-200 focus-within:border-green"}`}
                  >
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => {
                        setCouponError("");
                        setCoupon(e.target.value.toUpperCase());
                      }}
                      disabled={
                        !!couponDiscount || !isHydrated || isApplyingCoupon
                      }
                      placeholder="Promo code"
                      className="flex-1 bg-transparent outline-none px-4 py-3 text-sm font-bold placeholder:text-gray-400 uppercase tracking-wider"
                    />
                    {couponSuccess ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleCoupon}
                        disabled={
                          !coupon.trim() || !isHydrated || isApplyingCoupon
                        }
                        className="px-5 w-[80px] text-xs font-bold text-green hover:bg-green/25  bg-green/15 disabled:opacity-50"
                      >
                        {isApplyingCoupon ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-green"
                          />
                        ) : (
                          "Apply"
                        )}
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
                      <CheckCircle2 size={14} /> Applied successfully
                    </p>
                  )}
                </div>

                <div className="px-6 py-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {!isHydrated ? (
                    <div className="flex flex-col gap-4 py-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 animate-pulse"
                        >
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 bg-gray-100 rounded" />
                            <div className="h-2 w-1/2 bg-gray-50 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 py-4">
                      {cartItems.map((i) => (
                        <div key={i.slug} className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                            <BlurImage
                              src={i.imageUrl}
                              alt={i.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-verdant-dark truncate">
                              {i.name}{" "}
                              <span className="text-gray-400 font-medium">
                                x{i.quantity}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {i.unit}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-verdant-dark flex-shrink-0">
                            £{((i.pricePence * i.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    {!isHydrated ? (
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span className="font-bold text-verdant-dark">
                        £{subtotalFormatted}
                      </span>
                    )}
                  </div>
                  {couponDiscount > 0 && isHydrated && (
                    <div className="flex justify-between items-center text-sm text-green font-bold">
                      <span>Discount ({coupon})</span>
                      <span>−£{(couponDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Delivery</span>
                    {!isHydrated ? (
                      <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <span
                        className={`font-bold ${delivery === 0 ? "text-green" : "text-verdant-dark"}`}
                      >
                        {delivery === 0 ? "Free 🎉" : `£${deliveryFormatted}`}
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-verdant-dark text-base">
                      Total
                    </span>
                    <div className="text-right">
                      {!isHydrated ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-lg mt-1" />
                      ) : (
                        <p className="font-playfair font-black text-green text-3xl leading-none">
                          £{totalFormatted}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <TrustBadges />
            </div>
          </div>
        </Container>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-50 pb-safe">
        <button
          disabled={!selectedAddressId || isPaying || !isHydrated}
          onClick={onContinueToPayment}
          className="w-full bg-green text-white py-4 rounded-xl font-bold flex justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPaying ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Processing...
            </>
          ) : (
            `Pay ${isHydrated ? "£" + totalFormatted : "..."}`
          )}
        </button>
      </div>

      <CheckoutAddressListModal
        isOpen={isAddressListModalOpen}
        onClose={() => setIsAddressListModalOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setManualSelection}
        onAddNew={() => setIsAddressModalOpen(true)}
      />
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
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
