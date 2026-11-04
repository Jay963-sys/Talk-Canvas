"use client";

import { useState } from "react";
import { setAdvancedMatching } from "@/lib/meta/pixel";
import { Check } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

/** Earliest bookable day: tomorrow, as YYYY-MM-DD in local time. */
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function InspectionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    preferredDate: "",
    message: "",
    company: "", // honeypot
  });

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    void setAdvancedMatching(form.email, form.phone);
    try {
      const res = await fetch("/api/inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not send your request");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
          <Check size={24} strokeWidth={1.5} className="text-accent" />
        </div>
        <h3 className="display text-2xl font-normal">Request received.</h3>
        <p className="text-sm text-ink-soft mt-3 max-w-sm mx-auto leading-relaxed">
          We&apos;ll call you shortly to confirm a date and the inspection fee.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-ink-soft mb-2">Name</label>
          <input required type="text" value={form.name} onChange={set("name")} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-ink-soft mb-2">Phone</label>
          <input required type="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">
          Email <span className="text-muted">(optional)</span>
        </label>
        <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">Address in Lagos</label>
        <textarea
          required
          rows={2}
          value={form.address}
          onChange={set("address")}
          maxLength={1000}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-ink-soft mb-2">
            Area <span className="text-muted">(e.g. Lekki, Ikeja)</span>
          </label>
          <input type="text" value={form.area} onChange={set("area")} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-ink-soft mb-2">
            Preferred date <span className="text-muted">(optional)</span>
          </label>
          <input
            type="date"
            min={tomorrow()}
            value={form.preferredDate}
            onChange={set("preferredDate")}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">
          Anything we should know? <span className="text-muted">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={set("message")}
          maxLength={2000}
          placeholder="Which rooms or walls, the look you're going for..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={set("company")}
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-8 py-4 bg-ink text-cream uppercase text-xs tracking-[0.15em] hover:bg-ink-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Request an inspection"}
      </button>
    </form>
  );
}
