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
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p className="display-italic text-3xl mb-4">Your cart is empty.</p>
        <p className="text-sm text-ink-soft mb-8">
          Explore originals or design a print to get started.{" "}
        </p>
        <Link
          href="/prints"
          className="inline-block px-6 py-3 bg-accent text-cream text-sm font-medium tracking-wider"
        >
          Make a print
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
    <div className="fade-in max-w-7xl mx-auto px-6 md:px-10 py-12">
      <Link
        href="/prints"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Continue shopping
      </Link>

      <h1 className="display text-5xl md:text-7xl font-normal leading-none mb-12">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-7 space-y-10">
          {/* Delivery method */}
          <section>
            <h2 className="display text-2xl font-normal mb-6">Delivery</h2>
            <div className="grid grid-cols-2 gap-3">
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
                title="Showroom pickup"
                description="On set days"
                fee="Free"
              />
            </div>

            {deliveryMethod === "pickup" && (
              <div className="mt-4 p-5 bg-paper border border-line">
                <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                  Pickup location
                </p>
                <p className="text-sm leading-relaxed">
                  {SHIPPING_CONFIG.pickup.address}
                </p>
                <p className="text-xs text-ink-soft mt-2">
                  {SHIPPING_CONFIG.pickup.days} · {SHIPPING_CONFIG.pickup.hours}
                </p>
              </div>
            )}

            {deliveryMethod === "delivery" && (
              <p className="text-xs text-muted mt-3 leading-relaxed">
                {SHIPPING_CONFIG.delivery.description}
              </p>
            )}
          </section>

          {/* Contact */}
          <section>
            <h2 className="display text-2xl font-normal mb-6">Contact</h2>
            <div className="space-y-4">
              <Field
                label="Full name"
                name="name"
                value={form.name}
                onChange={setField("name")}
                required
              />
              <div className="grid grid-cols-2 gap-4">
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

          {/* Shipping address — only when delivering */}
          {deliveryMethod === "delivery" && (
            <section>
              <h2 className="display text-2xl font-normal mb-6">
                Shipping address
              </h2>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
              Order notes{" "}
              <span className="normal-case tracking-normal text-muted">
                (optional)
              </span>
            </h2>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder="Anything we should know — gift wrapping, occasion, special instructions..."
              className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none resize-none"
            />
          </section>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Pay ${formatNaira(total)}`}
          </button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>

        <div className="md:col-span-5">
          <div className="bg-paper p-7 sticky top-[100px]">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
              Order Summary
            </p>

            <div className="space-y-5 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-[60px] relative aspect-[4/5] bg-line overflow-hidden">
                    {" "}
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {item.type === "original" ? (
                      <>
                        <p className="display-italic text-base leading-tight">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {item.artist} · {item.year}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {item.frameName} · {item.sizeLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="display-italic text-base leading-tight">
                          Custom print
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {item.frameName}
                          {item.glass ? " · with glass" : ""} · {item.sizeLabel}
                        </p>
                      </>
                    )}
                    <p className="text-sm font-medium mt-2">
                      {formatNaira(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4 space-y-2">
              <SummaryLine label="Subtotal" value={formatNaira(subtotal)} />
              <SummaryLine
                label={deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                value={shipping === 0 ? "Free" : formatNaira(shipping)}
              />
            </div>
            <div className="border-t border-line mt-4 pt-4 flex justify-between items-baseline">
              <span className="text-sm text-muted">Total</span>
              <span className="display text-3xl font-medium">
                {formatNaira(total)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

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
      className={`p-4 border-[1.5px] text-left transition-all ${
        selected
          ? "border-ink bg-paper"
          : "border-line hover:border-ink-soft bg-cream"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`w-4 h-4 rounded-full border mt-1 shrink-0 flex items-center justify-center ${
            selected ? "border-ink" : "border-muted"
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-ink" />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <p className="text-sm font-medium mt-2 ml-6">{fee}</p>
    </button>
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
        className="block text-xs uppercase tracking-[0.1em] text-muted mb-2"
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
        className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none transition-colors text-[15px]"
      />
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
