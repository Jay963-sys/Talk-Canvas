"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { formatNaira } from "@/lib/store";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p className="display-italic text-3xl mb-4">Your cart is empty.</p>
        <p className="text-sm text-ink-soft mb-8">
          Make a print to get started.
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
  const shipping = 5000; // flat for now — adjust in step 8
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Step 8: hand off to Paystack here
    clear();
    router.push("/checkout/success");
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

          <button
            type="submit"
            className="w-full py-5 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors"
          >
            Pay {formatNaira(total)}
          </button>
          <p className="text-xs text-muted text-center italic">
            Prototype — Paystack integration comes in step 8.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="bg-paper p-7 sticky top-[100px]">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-6">
              Order Summary
            </p>

            <div className="space-y-5 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-line shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="display-italic text-base leading-tight">
                      Custom print
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {item.frameName} · {item.sizeName}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      {formatNaira(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4 space-y-2">
              <SummaryLine label="Subtotal" value={formatNaira(subtotal)} />
              <SummaryLine label="Shipping" value={formatNaira(shipping)} />
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
