"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 border border-line bg-paper">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
          <Check size={24} strokeWidth={1.5} className="text-accent" />
        </div>
        <h3 className="display text-2xl font-normal">Message sent.</h3>
        <p className="text-sm text-ink-soft mt-3 max-w-sm mx-auto leading-relaxed">
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-ink-soft mb-2">Name</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">
          Phone <span className="text-muted">(optional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-2">Message</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none resize-none"
        />
      </div>

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
        {submitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
