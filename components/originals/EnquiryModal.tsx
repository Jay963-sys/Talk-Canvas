"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface Work {
  id: string;
  title: string;
  artist: string;
  price: string;
}

export default function EnquiryModal({
  work,
  onClose,
}: {
  work: Work;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: work.id,
          workTitle: work.title,
          ...form,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fade-in fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-line">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Enquire
          </p>
          <button onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {done ? (
          <div className="px-7 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-accent text-cream flex items-center justify-center mx-auto mb-6">
              <Check size={24} strokeWidth={1.5} />
            </div>
            <p className="display text-3xl font-normal leading-tight">
              Thank you.
              <br />
              <span className="display-italic">We'll be in touch.</span>
            </p>
            <p className="text-sm text-ink-soft mt-4">
              The gallery typically replies within one business day.
            </p>
            <button
              onClick={onClose}
              className="mt-8 px-6 py-3 border border-line text-sm font-medium hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
            <div>
              <p className="display-italic text-2xl leading-tight">
                {work.title}
              </p>
              <p className="text-xs text-muted mt-1">
                {work.artist} · {work.price}
              </p>
            </div>

            <Field
              label="Your name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Field
              label="Phone (optional)"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                placeholder="Anything you'd like the gallery to know — viewing requests, shipping, payment plans, etc."
                className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none transition-colors text-[15px] resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send enquiry"}
            </button>
            <p className="text-[11px] text-muted text-center">
              The gallery will reply by email within one business day.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none transition-colors text-[15px]"
      />
    </div>
  );
}
