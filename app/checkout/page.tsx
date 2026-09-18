"use client";

import { useState, useEffect, useRef } from "react";
import { getFbCookies, initiateCheckout } from "@/lib/meta/pixel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Check, Loader2 } from "lucide-react";
import {
  useCart,
  cartSubtotal,
  discountableSubtotal,
  discountFor,
  cartHasSet,
} from "@/lib/cartStore";
import { formatNaira } from "@/lib/store";
import {
  LAGOS_ZONES,
  OUTSIDE_LAGOS_ID,
  OUTSIDE_LAGOS_NOTE,
} from "@/data/delivery";
import { quoteDelivery, VEHICLE_LABELS } from "@/lib/deliveryCalc";
import Image from "next/image";

interface AppliedCode {
  code: string;
  discountPercent: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryZone, setDeliveryZone] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [notes, setNotes] = useState("");

  // Affiliate / discount code
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCode | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "failed")
      setError("Payment wasn't completed — you can try again.");
    else if (p === "error" || p === "missing_ref")
      setError(
        "We couldn't confirm your payment. If you were charged, contact us and we'll sort it immediately.",
      );
  }, []);

  const initiateFired = useRef(false);
  useEffect(() => {
    if (!mounted || items.length === 0 || initiateFired.current) return;
    initiateFired.current = true;
    const contents = items.map((i) => ({
      id: i.type === "original" ? `original_${i.originalId}` : "print",
      quantity: i.quantity,
      item_price: i.price,
    }));
    initiateCheckout({ contents, value: cartSubtotal(items) });
  }, [mounted, items]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill from an affiliate link (?ref=CODE dropped a cookie on landing).
  useEffect(() => {
    const fromCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tc_ref="))
      ?.split("=")[1];
    if (fromCookie) setCodeInput(decodeURIComponent(fromCookie));
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="fade-in max-w-2xl mx-auto px-6 py-32 text-center min-h-[70vh] flex flex-col justify-center items-center">
        <p className="display text-3xl md:text-4xl mb-4 text-ink font-normal">
          Your cart is empty.
        </p>
        <p className="text-[15px] text-ink-soft mb-8">
          Explore originals or design a print to get started.
        </p>
        <Link
          className="inline-block px-8 py-3.5 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
          href="/prints"
        >
          Shop Prints
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const eligible = discountableSubtotal(items);
  const discount = applied ? discountFor(items, applied.discountPercent) : 0;

  const quote = deliveryZone
    ? quoteDelivery(
        deliveryZone,
        items.map((i) => ({
          sizeId: i.type === "print" ? i.sizeId : null,
          quantity: i.quantity,
          // The cart holds a set as one line, so panels are counted here.
          setSize: i.type === "print" && i.set ? i.set.pieces.length : 1,
          isSet: i.type === "print" && i.set !== null,
        })),
      )
    : null;

  const hasSet = cartHasSet(items);

  const shipping = quote?.fee ?? 0;
  const total = subtotal - discount + shipping;
  const awaitingZone = !deliveryZone;

  // True when the cart is nothing but one-of-one artist works — a code would
  // validate but take nothing off, so say so rather than show "−₦0".
  const nothingEligible = eligible === 0;

  const applyCode = async () => {
    const code = codeInput.trim();
    if (!code) return;

    setCodeChecking(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Email is sent so the "once per customer" check runs before payment,
        // not after. If they haven't typed it yet, the server re-checks on submit.
        body: JSON.stringify({ code, email: form.email || undefined }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setApplied(null);
        setCodeError(data.error || "That code isn't valid.");
        return;
      }

      setApplied({ code: data.code, discountPercent: data.discountPercent });
      setCodeInput(data.code);
    } catch {
      setCodeError("Couldn't check that code — try again.");
    } finally {
      setCodeChecking(false);
    }
  };

  const removeCode = () => {
    setApplied(null);
    setCodeInput("");
    setCodeError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { fbp, fbc } = getFbCookies();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          deliveryMethod: "delivery",
          address: {
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          items: items.map((item) =>
            item.type === "original"
              ? {
                  type: "original" as const,
                  originalId: item.originalId,
                  imageUrl: item.imageUrl,
                  imagePublicId: item.imagePublicId,
                  frameName: item.frameName,
                  glass: item.glass,
                  sizeLabel: item.sizeLabel,
                  title: item.title,
                  artist: item.artist,
                  year: item.year,
                  price: item.price,
                  quantity: item.quantity,
                }
              : {
                  type: "print" as const,
                  imageUrl: item.imageUrl,
                  imagePublicId: item.imagePublicId,
                  frameId: item.frameId,
                  frameName: item.frameName,
                  glass: item.glass,
                  sizeId: item.sizeId,
                  sizeLabel: item.sizeLabel,
                  orientation: item.orientation,
                  price: item.price,
                  quantity: item.quantity,
                  setId: item.set?.setId,
                },
          ),
          subtotal,
          shipping,
          total,
          deliveryZone: deliveryZone,
          affiliateCode: applied?.code,
          notes: notes.trim() !== "" ? notes : undefined,
          fbp,
          fbc,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Order failed");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      clear();
      router.push(`/checkout/success?id=${data.orderId}`);
    } catch {
      setError("Network error — please try again");
      setSubmitting(false);
    }
  };

  const setField =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Minimalist Header */}
        <Link
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
          href="/prints"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Continue Shopping
        </Link>

        <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-none mb-12 md:mb-16">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start"
        >
          {/* Left Column - Forms */}
          <div className="md:col-span-7 space-y-12">
            {/* Delivery Area */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Delivery Area
              </h2>
              <div>
                <select
                  id="deliveryZone"
                  required
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-line focus:border-ink outline-none transition-colors text-[14px] text-ink"
                >
                  <option value="" disabled>
                    Select your area…
                  </option>
                  <optgroup label="Lagos">
                    {LAGOS_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                      </option>
                    ))}
                  </optgroup>
                  <option value={OUTSIDE_LAGOS_ID}>Outside Lagos</option>
                </select>

                {quote && !quote.quoteOnRequest && (
                  <>
                    <p className="text-[13px] text-ink-soft mt-3 leading-relaxed">
                      Delivered by {VEHICLE_LABELS[quote.vehicle].toLowerCase()}
                      , based on the size and number of pieces in your order.
                    </p>
                    <p className="text-[12px] text-ink-soft mt-2 leading-relaxed">
                      This fee can shift with your exact location or any change
                      to your order — we&apos;ll contact you before dispatch if
                      it does.
                    </p>
                  </>
                )}

                {quote?.quoteOnRequest && (
                  <div className="mt-4 border-l-2 border-ink bg-paper px-5 py-4">
                    <p className="text-[13px] text-ink leading-relaxed">
                      {hasSet && deliveryZone !== OUTSIDE_LAGOS_ID
                        ? "Your order includes a set, which we deliver by arrangement. We'll confirm the cost with you after you order — nothing is charged for delivery now."
                        : OUTSIDE_LAGOS_NOTE}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Contact Information
              </h2>
              <div className="space-y-5">
                <Field
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={setField("name")}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    required
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Shipping Address
              </h2>
              <div className="space-y-5">
                <Field
                  label="Address"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={setField("addressLine1")}
                  required
                />
                <Field
                  label="Apartment, suite, etc. (optional)"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={setField("addressLine2")}
                />
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={setField("city")}
                    required
                  />
                  <Field
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={setField("state")}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    label="Postal code"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={setField("postalCode")}
                  />
                  <Field
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={setField("country")}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Discount code */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6 flex items-center gap-2">
                Discount Code
                <span className="text-ink-soft lowercase tracking-normal font-normal">
                  (optional)
                </span>
              </h2>

              {applied ? (
                <div className="flex items-center justify-between gap-4 px-4 py-3 border border-ink bg-paper">
                  <span className="flex items-center gap-2 text-[14px] text-ink">
                    <Check size={16} strokeWidth={1.5} />
                    <span className="font-medium">{applied.code}</span>
                    <span className="text-ink-soft">
                      · {applied.discountPercent}% off
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={removeCode}
                    aria-label="Remove code"
                    className="text-ink-soft hover:text-ink transition-colors p-1"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      setCodeError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCode();
                      }
                    }}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 bg-transparent border border-line focus:border-ink outline-none transition-colors text-[14px] text-ink placeholder:text-ink-soft uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCode}
                    disabled={codeChecking || !codeInput.trim()}
                    className="px-6 py-3 border border-ink text-ink text-[12px] uppercase tracking-widest font-medium hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink flex items-center gap-2"
                  >
                    {codeChecking ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
              )}

              {codeError && (
                <p className="text-[13px] text-red-600 mt-3">{codeError}</p>
              )}

              {applied && nothingEligible && (
                <p className="text-[13px] text-ink-soft mt-3 leading-relaxed">
                  Discounts don't apply to one-of-one artist works, so this code
                  takes nothing off your current cart.
                </p>
              )}
            </section>

            {/* Order Notes */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6 flex items-center gap-2">
                Order Notes
                <span className="text-ink-soft lowercase tracking-normal font-normal">
                  (optional)
                </span>
              </h2>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                placeholder="Gift wrapping, occasion, special instructions..."
                className="w-full px-4 py-3 border border-line bg-transparent focus:border-ink outline-none resize-none text-[14px] placeholder:text-ink-soft transition-colors"
              />
            </section>

            {/* Mobile Submit Button */}
            <div className="md:hidden pt-4">
              <button
                type="submit"
                disabled={submitting || awaitingZone}
                className="w-full py-4 bg-ink hover:bg-ink-soft text-cream text-[12px] uppercase tracking-widest font-medium transition-colors disabled:opacity-60"
              >
                {submitting
                  ? "Processing..."
                  : awaitingZone
                    ? "Choose a delivery area"
                    : `Pay ${formatNaira(total)}`}
              </button>
              {error && (
                <p className="text-[13px] text-red-600 text-center mt-3">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-5">
            <div className="bg-paper p-8 lg:p-10 rounded-2xl border border-line/40 sticky top-[100px]">
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-8">
                Order Summary
              </h2>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-[70px] relative aspect-[4/5] bg-line overflow-hidden rounded-sm shrink-0">
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        src={item.imageUrl}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      {item.type === "original" ? (
                        <>
                          <p className="display text-[15px] leading-tight text-ink mb-1">
                            {item.title}
                          </p>
                          <p className="text-[12px] text-ink-soft">
                            {item.artist} · {item.year}
                          </p>
                          <p className="text-[12px] text-ink-soft mt-0.5">
                            {item.frameName}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="display text-[15px] leading-tight text-ink mb-1">
                            Custom Print
                          </p>
                          <p className="text-[12px] text-ink-soft">
                            {item.frameName} {item.glass ? "· Glass" : ""}
                          </p>
                          <p className="text-[12px] text-ink-soft mt-0.5">
                            {item.sizeLabel}
                          </p>
                        </>
                      )}
                      <p className="text-[13px] font-medium text-ink mt-2">
                        {formatNaira(item.price * item.quantity)}
                        {item.quantity > 1 && (
                          <span className="text-[12px] text-ink-soft font-normal">
                            {" "}
                            · Qty {item.quantity}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line/60 pt-6 space-y-3">
                <SummaryLine label="Subtotal" value={formatNaira(subtotal)} />
                {discount > 0 && applied && (
                  <SummaryLine
                    label={`${applied.code} (${applied.discountPercent}% off)`}
                    value={`− ${formatNaira(discount)}`}
                    accent
                  />
                )}
                <SummaryLine
                  label="Delivery"
                  value={
                    awaitingZone
                      ? "—"
                      : quote?.quoteOnRequest
                        ? "Quoted after order"
                        : formatNaira(shipping)
                  }
                />
              </div>

              <div className="border-t border-line/60 mt-6 pt-6 flex justify-between items-end">
                <span className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold">
                  Total
                </span>
                <span className="display text-3xl font-medium text-ink leading-none">
                  {formatNaira(total)}
                </span>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden md:block mt-10">
                <button
                  type="submit"
                  disabled={submitting || awaitingZone}
                  className="w-full py-4 bg-ink hover:bg-ink-soft text-cream text-[12px] uppercase tracking-widest font-medium transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? "Processing..."
                    : awaitingZone
                      ? "Choose a delivery area"
                      : `Pay ${formatNaira(total)}`}
                </button>
                {error && (
                  <p className="text-[13px] text-red-600 text-center mt-4">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[10px] uppercase tracking-widest text-ink-soft font-semibold mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-transparent border border-line focus:border-ink outline-none transition-colors text-[14px] text-ink"
      />
    </div>
  );
}

function SummaryLine({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-[14px] gap-4">
      <span className={accent ? "text-ink" : "text-ink-soft"}>{label}</span>
      <span
        className={`font-medium whitespace-nowrap ${accent ? "text-ink" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
