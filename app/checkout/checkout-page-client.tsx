"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/store/cart-context";
import {
  defaultCheckoutDraft,
  type CheckoutDraft,
  readCheckoutDraft,
  writeCheckoutDraft,
} from "@/lib/checkout-draft";
import type { CouponResolution } from "@/lib/coupons";
import { DELIVERY_SLOT_OPTIONS, getShippingQuote } from "@/lib/shipping-rules";

type RazorpayCheckoutData = {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  merchantName: string;
  description: string;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STEP_TITLES = ["Delivery Details", "Message & Sender", "Review & Pay"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[0.85rem] font-semibold text-[var(--foreground)]">
      {label}
      {children}
    </label>
  );
}

function buildDeliveryAddress(draft: CheckoutDraft) {
  const lines = [
    `H No: ${draft.houseNumber.trim()}`,
    `Apt/Lane: ${draft.aptLane.trim()}`,
    draft.landmark.trim() ? `Landmark: ${draft.landmark.trim()}` : "",
    `Colony/Area: ${draft.colonyArea.trim()}`,
    `City: ${draft.city.trim()}`,
    `State: ${draft.state.trim()}`,
    `Country: ${draft.country.trim()}`,
    `Pincode: ${draft.deliveryPincode.trim()}`,
  ].filter(Boolean);

  return lines.join(", ");
}

function buildOrderNotes(draft: CheckoutDraft) {
  const notes = [
    draft.senderName.trim() ? `Sender Name: ${draft.senderName.trim()}` : "",
    draft.alternatePhone.trim()
      ? `Alternate Phone: ${draft.alternatePhone.trim()}`
      : "",
    draft.mapLink.trim() ? `Google Map Link: ${draft.mapLink.trim()}` : "",
  ].filter(Boolean);

  return notes.length > 0 ? notes.join("\n") : undefined;
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CheckoutDraft>(() => readCheckoutDraft());
  const [couponResolution, setCouponResolution] = useState<CouponResolution>({
    valid: false,
    discountAmount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shippingQuote = getShippingQuote({
    pincode: draft.deliveryPincode,
    slot: draft.deliverySlot,
  });
  const delivery = items.length > 0 && shippingQuote.deliverable ? shippingQuote.deliveryFee : 0;
  const discountAmount = couponResolution.discountAmount;
  const total = Math.max(1, subtotal + delivery - discountAmount);

  const summaryValues = {
    subtotal,
    delivery,
    total: items.length > 0 ? total : 0,
  };

  const updateDraftField = (field: keyof CheckoutDraft, value: string) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      writeCheckoutDraft(next);
      return next;
    });
  };

  useEffect(() => {
    const couponCode = draft.couponCode.trim();
    let cancelled = false;

    if (!couponCode) {
      setCouponResolution({ valid: false, discountAmount: 0 });
      return;
    }

    async function resolveCoupon() {
      try {
        const response = await fetch("/api/coupons/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ couponCode, subtotal }),
        });
        const payload = (await response.json()) as {
          data?: CouponResolution;
          error?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.data) {
          setCouponResolution({
            valid: false,
            discountAmount: 0,
            message: payload.error ?? "Unable to validate coupon.",
          });
          return;
        }

        setCouponResolution(payload.data);
      } catch {
        if (!cancelled) {
          setCouponResolution({
            valid: false,
            discountAmount: 0,
            message: "Unable to validate coupon.",
          });
        }
      }
    }

    resolveCoupon();

    return () => {
      cancelled = true;
    };
  }, [draft.couponCode, subtotal]);

  const validateStepOne = () => {
    if (!draft.fullName.trim()) {
      return "Please enter your full name.";
    }
    if (!draft.phone.trim()) {
      return "Please enter your phone number.";
    }
    if (!draft.houseNumber.trim()) {
      return "Please enter your house or flat number.";
    }
    if (!draft.aptLane.trim()) {
      return "Please enter your apartment or street.";
    }
    if (!draft.colonyArea.trim()) {
      return "Please enter your colony or area.";
    }
    if (!draft.city.trim()) {
      return "Please enter your city.";
    }
    if (!draft.deliveryPincode.trim()) {
      return "Please enter the delivery pincode.";
    }
    if (!draft.deliveryDate.trim()) {
      return "Please choose a delivery date.";
    }
    if (draft.mapLink.trim() && !/^https?:\/\/.+/i.test(draft.mapLink.trim())) {
      return "Please paste a full Google Maps link (starting with https://).";
    }
    if (!shippingQuote.deliverable) {
      return shippingQuote.message;
    }
    return "";
  };

  const handleContinueFromStepOne = () => {
    const validationError = validateStepOne();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleContinueFromStepTwo = () => {
    setErrorMessage("");
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Add cakes before checkout.");
      return;
    }

    const validationError = validateStepOne();
    if (validationError) {
      setErrorMessage(validationError);
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const checkoutResponse = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            fullName: draft.fullName,
            phone: draft.phone,
            email: draft.email || undefined,
          },
          delivery: {
            date: draft.deliveryDate,
            slot: draft.deliverySlot,
            pincode: draft.deliveryPincode,
            address: buildDeliveryAddress(draft),
            cakeMessage: draft.cakeMessage || undefined,
            city: draft.city,
          },
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
            weightId: item.weightId,
            flavorId: item.flavorId,
          })),
          couponCode: draft.couponCode || undefined,
          notes: buildOrderNotes(draft),
        }),
      });

      const checkoutPayload = (await checkoutResponse.json()) as {
        error?: string;
        data?: {
          order: {
            id: string;
            orderNumber: string;
          };
          razorpay: RazorpayCheckoutData;
        };
      };

      if (!checkoutResponse.ok || !checkoutPayload.data) {
        throw new Error(checkoutPayload.error ?? "Unable to initialize payment.");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please retry.");
      }

      const { order, razorpay } = checkoutPayload.data;

      const rz = new window.Razorpay({
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.merchantName,
        description: razorpay.description,
        order_id: razorpay.orderId,
        prefill: razorpay.prefill,
        theme: {
          color: "#77171C",
        },
        handler: async (paymentResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const confirmResponse = await fetch("/api/orders/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            }),
          });

          const confirmPayload = (await confirmResponse.json()) as {
            error?: string;
            data?: {
              order: {
                orderNumber: string;
              };
            };
          };

          if (!confirmResponse.ok || !confirmPayload.data) {
            throw new Error(confirmPayload.error ?? "Payment verification failed.");
          }

          writeCheckoutDraft(defaultCheckoutDraft);
          clear();
          router.push(
            `/thank-you?orderNumber=${encodeURIComponent(confirmPayload.data.order.orderNumber)}`,
          );
        },
      });

      rz.open();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white page-pad py-10">
      <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2rem] font-semibold text-black">Checkout</h1>
          <p className="mt-2 text-[1rem] leading-8 text-[var(--text-secondary)]">
            Three quick steps: where and when to deliver, what to write on the cake, then
            review and pay securely.
          </p>

          {items.length === 0 ? (
            <p className="mt-6 rounded-[14px] bg-[var(--background)] px-4 py-3 text-[0.95rem] text-[var(--foreground)]">
              Your cart is empty.{" "}
              <Link href="/cakes" className="font-semibold text-[var(--brand-primary)] underline">
                Browse cakes
              </Link>{" "}
              to add something before checking out.
            </p>
          ) : null}

          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {STEP_TITLES.map((title, index) => {
                const stepNumber = index + 1;
                const active = step === stepNumber;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setStep(stepNumber)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active
                        ? "bg-[var(--brand-primary)] text-white"
                        : "border border-[rgba(0,0,0,0.12)] text-[var(--foreground)]"
                    }`}
                  >
                    {stepNumber}. {title}
                  </button>
                );
              })}
            </div>

            {step === 1 ? (
              <div className="mt-6 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Full name">
                    <input
                      value={draft.fullName}
                      autoComplete="name"
                      onChange={(event) => updateDraftField("fullName", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      value={draft.phone}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      onChange={(event) => updateDraftField("phone", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="10-digit mobile number"
                    />
                  </Field>
                  <Field label="Alternate phone (optional)">
                    <input
                      value={draft.alternatePhone}
                      type="tel"
                      inputMode="tel"
                      onChange={(event) => updateDraftField("alternatePhone", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="Another number we can call"
                    />
                  </Field>
                  <Field label="Email (optional)">
                    <input
                      value={draft.email}
                      autoComplete="email"
                      onChange={(event) => updateDraftField("email", event.target.value)}
                      type="email"
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="For your order confirmation"
                    />
                  </Field>
                  <Field label="House / flat number">
                    <input
                      value={draft.houseNumber}
                      onChange={(event) => updateDraftField("houseNumber", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="e.g. 8-2-293/A"
                    />
                  </Field>
                  <Field label="Apartment / street">
                    <input
                      value={draft.aptLane}
                      autoComplete="address-line1"
                      onChange={(event) => updateDraftField("aptLane", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="Building or street name"
                    />
                  </Field>
                  <Field label="Landmark (optional)">
                    <input
                      value={draft.landmark}
                      onChange={(event) => updateDraftField("landmark", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="e.g. Near City Centre Mall"
                    />
                  </Field>
                  <Field label="Colony / area">
                    <input
                      value={draft.colonyArea}
                      autoComplete="address-line2"
                      onChange={(event) => updateDraftField("colonyArea", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="e.g. Banjara Hills"
                    />
                  </Field>
                  <Field label="Google Maps link (optional)">
                    <input
                      value={draft.mapLink}
                      onChange={(event) => updateDraftField("mapLink", event.target.value)}
                      type="url"
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="Paste a location link"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      value={draft.city}
                      autoComplete="address-level2"
                      onChange={(event) => updateDraftField("city", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="City"
                    />
                  </Field>
                  <Field label="Delivery date">
                    <input
                      value={draft.deliveryDate}
                      onChange={(event) => updateDraftField("deliveryDate", event.target.value)}
                      type="date"
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                    />
                  </Field>
                  <Field label="Delivery pincode">
                    <input
                      value={draft.deliveryPincode}
                      autoComplete="postal-code"
                      onChange={(event) => updateDraftField("deliveryPincode", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      value={draft.state}
                      readOnly
                      disabled
                      className="rounded-[14px] border border-[var(--line)] bg-stone-100 px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="State"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={draft.country}
                      readOnly
                      disabled
                      className="rounded-[14px] border border-[var(--line)] bg-stone-100 px-4 py-3 text-sm text-[var(--foreground)]"
                      placeholder="Country"
                    />
                  </Field>
                  <Field label="Delivery time">
                    <select
                      value={draft.deliverySlot}
                      onChange={(event) => updateDraftField("deliverySlot", event.target.value)}
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                    >
                      {DELIVERY_SLOT_OPTIONS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {draft.deliveryPincode ? (
                  <p
                    className={`text-[0.9rem] font-semibold ${
                      shippingQuote.deliverable ? "text-[#2f8f2f]" : "text-[#b53131]"
                    }`}
                  >
                    {shippingQuote.message}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleContinueFromStepOne}
                  className="rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white"
                >
                  Continue to Message
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-6 space-y-3">
                <Field label="Message on cake (optional)">
                  <input
                    value={draft.cakeMessage}
                    onChange={(event) => updateDraftField("cakeMessage", event.target.value)}
                    className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                    placeholder="e.g. Happy Birthday Rahul"
                  />
                </Field>
                <Field label="From (optional)">
                  <input
                    value={draft.senderName}
                    onChange={(event) => updateDraftField("senderName", event.target.value)}
                    className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
                    placeholder="e.g. Mom & Dad"
                  />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueFromStepTwo}
                    className="rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-6 space-y-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[var(--background)] p-5">
                <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  Review Order
                </p>
                <div className="space-y-2 text-[0.95rem] leading-7 text-[var(--text-secondary)]">
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Delivery:</span>{" "}
                    {draft.deliveryDate} | {draft.deliverySlot}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Pincode:</span>{" "}
                    {draft.deliveryPincode}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">H No:</span>{" "}
                    {draft.houseNumber}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Apt/Lane:</span>{" "}
                    {draft.aptLane}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Landmark:</span>{" "}
                    {draft.landmark || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Colony/Area:</span>{" "}
                    {draft.colonyArea}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">City:</span> {draft.city}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">State:</span> {draft.state}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Country:</span>{" "}
                    {draft.country}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Google Map Link:</span>{" "}
                    {draft.mapLink || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Alternate Phone:</span>{" "}
                    {draft.alternatePhone || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Cake Message:</span>{" "}
                    {draft.cakeMessage || "No message"}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Sender Name:</span>{" "}
                    {draft.senderName || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Items:</span>{" "}
                    {items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Processing..." : "Place Order & Pay"}
                  </button>
                </div>
              </div>
            ) : null}
          </>

          {errorMessage ? (
            <p className="mt-4 rounded-[14px] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#b53131]">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <aside className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[var(--surface-accent)] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h2 className="text-[1.4rem] font-semibold text-black">Order Summary</h2>
            <div className="mt-5 space-y-3 text-[1rem] text-[var(--text-secondary)]">
            <div>
              <label
                className="mb-1 block text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]"
                htmlFor="coupon-code"
              >
                Coupon Code
              </label>
              <input
                id="coupon-code"
                value={draft.couponCode}
                onChange={(event) =>
                  updateDraftField("couponCode", event.target.value.toUpperCase())
                }
                className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[0.92rem] text-[var(--foreground)]"
                placeholder="Enter coupon code"
              />
              {draft.couponCode.trim() ? (
                <p
                  className={`mt-2 text-[0.82rem] font-semibold ${
                    couponResolution.valid ? "text-[#2f8f2f]" : "text-[#b53131]"
                  }`}
                >
                  {couponResolution.message ?? "Coupon check complete."}
                </p>
              ) : null}
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {summaryValues.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>Rs. {summaryValues.delivery}</span>
            </div>
            {discountAmount > 0 ? (
              <div className="flex justify-between text-[#2f8f2f]">
                <span>Coupon Discount</span>
                <span>- Rs. {discountAmount}</span>
              </div>
            ) : null}
            {draft.deliveryPincode && shippingQuote.deliverable ? (
              <p className="text-[0.84rem] font-semibold text-[#2f8f2f]">
                {shippingQuote.zoneName} shipping applied
                {shippingQuote.midnightSurcharge > 0
                  ? ` (includes Rs. ${shippingQuote.midnightSurcharge} midnight add-on)`
                  : ""}
                .
              </p>
            ) : null}
            <div className="flex justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
          </div>
          <div className="mt-5 border-t border-[rgba(0,0,0,0.12)] pt-4">
            <div className="flex justify-between text-[1.1rem] font-semibold text-black">
              <span>Total</span>
              <span>Rs. {summaryValues.total}</span>
            </div>
          </div>
          <Link
            href="/cart"
            className="mt-5 inline-flex rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-[var(--foreground)]"
          >
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  );
}
