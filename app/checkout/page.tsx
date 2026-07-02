"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { formatNaira } from "@/lib/store";
import { SHIPPING_CONFIG } from "@/data/shipping";
import Image from "next/image";

type DeliveryMethod = "delivery" | "pickup";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");

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

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "failed")
      setError("Payment wasn't completed — you can try again.");
    else if (p === "error" || p === "missing_ref")
      setError(
        "We couldn't confirm your payment. If you were charged, contact us and we'll sort it immediately.",
      );
  }, []);

  useEffect(() => {
    setMounted(true);
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
          href="/prints"
          className="inline-block px-8 py-3.5 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
        >
          Gallery Walls
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping =
    deliveryMethod === "pickup" ? 0 : SHIPPING_CONFIG.delivery.fee;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

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
          deliveryMethod,
          address:
            deliveryMethod === "delivery"
              ? {
                  addressLine1: form.addressLine1,
                  addressLine2: form.addressLine2,
                  city: form.city,
                  state: form.state,
                  postalCode: form.postalCode,
                  country: form.country,
                }
              : null,
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
                  price: item.price,
                },
          ),
          subtotal,
          shipping,
          total,
          notes: notes.trim() !== "" ? notes : undefined,
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
          href="/prints"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-12"
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
            {/* Delivery Method */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Delivery Method
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <DeliveryOption
                  selected={deliveryMethod === "delivery"}
                  onClick={() => setDeliveryMethod("delivery")}
                  title="Delivery"
                  description="Door-to-door"
                  fee={formatNaira(SHIPPING_CONFIG.delivery.fee)}
                />
                <DeliveryOption
                  selected={deliveryMethod === "pickup"}
                  onClick={() => setDeliveryMethod("pickup")}
                  title="Showroom Pickup"
                  description="On set days"
                  fee="Free"
                />
              </div>

              {deliveryMethod === "pickup" && (
                <div className="mt-6 p-6 bg-paper rounded-xl border border-line/40">
                  <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-3">
                    Pickup Location
                  </p>
                  <p className="text-[14px] leading-relaxed text-ink">
                    {SHIPPING_CONFIG.pickup.address}
                  </p>
                  <p className="text-[13px] text-ink-soft mt-3">
                    {SHIPPING_CONFIG.pickup.days} ·{" "}
                    {SHIPPING_CONFIG.pickup.hours}
                  </p>
                </div>
              )}

              {deliveryMethod === "delivery" && (
                <p className="text-[13px] text-ink-soft mt-4 leading-relaxed">
                  {SHIPPING_CONFIG.delivery.description}
                </p>
              )}
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
            {deliveryMethod === "delivery" && (
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
            )}

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

            {/* Mobile Submit Button (Hidden on Desktop, shown for better mobile UX) */}
            <div className="md:hidden pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-ink hover:bg-ink-soft text-cream text-[12px] uppercase tracking-widest font-medium transition-colors disabled:opacity-60"
              >
                {submitting ? "Processing..." : `Pay ${formatNaira(total)}`}
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
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
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
                        {formatNaira(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line/60 pt-6 space-y-3">
                <SummaryLine label="Subtotal" value={formatNaira(subtotal)} />
                <SummaryLine
                  label={deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                  value={shipping === 0 ? "Free" : formatNaira(shipping)}
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
                  disabled={submitting}
                  className="w-full py-4 bg-ink hover:bg-ink-soft text-cream text-[12px] uppercase tracking-widest font-medium transition-colors disabled:opacity-60"
                >
                  {submitting ? "Processing..." : `Pay ${formatNaira(total)}`}
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

// Restyled for premium UI: rounded corners, soft transitions, and sharp selection states
function DeliveryOption({
  selected,
  onClick,
  title,
  description,
  fee,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  fee: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-5 text-left transition-all rounded-xl border ${
        selected
          ? "border-ink bg-paper shadow-sm"
          : "border-line bg-transparent hover:border-ink-soft"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
            selected ? "border-ink" : "border-ink-soft"
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-ink" />}
        </span>
        <div className="flex-1">
          <p
            className={`text-[14px] font-medium transition-colors ${selected ? "text-ink" : "text-ink-soft"}`}
          >
            {title}
          </p>
          <p className="text-[12px] text-ink-soft mt-1">{description}</p>
        </div>
      </div>
      <p
        className={`text-[13px] font-medium mt-3 ml-7 ${selected ? "text-ink" : "text-ink-soft"}`}
      >
        {fee}
      </p>
    </button>
  );
}

// Refined inputs with transparent backgrounds to let the bg-cream shine through
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

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[14px]">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}
