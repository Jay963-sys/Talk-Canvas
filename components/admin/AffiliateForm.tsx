"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Affiliate } from "@/lib/db/schema";

const inputCls =
  "w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

/** The gallery's usual allowance. Not a cap — just a nudge if they go above it. */
const TYPICAL_ALLOWANCE = 20;

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function AffiliateForm({
  affiliate,
}: {
  affiliate?: Affiliate;
}) {
  const router = useRouter();
  const isEdit = !!affiliate;

  const [kind, setKind] = useState<"affiliate" | "promo">(
    (affiliate?.kind as "affiliate" | "promo") ?? "affiliate",
  );
  const [code, setCode] = useState(affiliate?.code ?? "");
  const [name, setName] = useState(affiliate?.name ?? "");
  const [email, setEmail] = useState(affiliate?.email ?? "");
  const [phone, setPhone] = useState(affiliate?.phone ?? "");
  const [notes, setNotes] = useState(affiliate?.notes ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    String(affiliate?.discountPercent ?? 10),
  );
  const [expiresAt, setExpiresAt] = useState(toDateInput(affiliate?.expiresAt));
  const [isActive, setIsActive] = useState(affiliate?.isActive ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = Number(discountPercent);
  const aboveTypical = Number.isFinite(pct) && pct > TYPICAL_ALLOWANCE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/affiliates/${affiliate.id}`
          : "/api/admin/affiliates",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            code: code.trim().toUpperCase(),
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            notes: notes.trim() || null,
            discountPercent: Math.round(pct),
            expiresAt: expiresAt || null,
            isActive,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/affiliates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const shareLink = code.trim()
    ? `${baseUrl}/?ref=${code.trim().toUpperCase()}`
    : "";

  const statsLink =
    typeof window !== "undefined" &&
    kind === "affiliate" &&
    affiliate?.statsToken
      ? `${baseUrl}/partner/${affiliate.statsToken}`
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Type
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKind("affiliate")}
            className={`px-5 py-3 border text-sm transition-colors ${
              kind === "affiliate"
                ? "border-ink bg-ink text-cream"
                : "border-line bg-cream text-ink hover:border-ink-soft"
            }`}
          >
            Influencer code
          </button>
          <button
            type="button"
            onClick={() => setKind("promo")}
            className={`px-5 py-3 border text-sm transition-colors ${
              kind === "promo"
                ? "border-ink bg-ink text-cream"
                : "border-line bg-cream text-ink hover:border-ink-soft"
            }`}
          >
            Site promo
          </button>
        </div>
        <p className="text-xs text-muted mt-3 leading-relaxed">
          {kind === "affiliate"
            ? "Belongs to an influencer. They get a share link and a private stats page."
            : "A site-wide offer. The most recent active promo shows in the first-visit pop-up. No influencer, no stats page."}
        </p>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          The code
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Code</label>
            <input
              required
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="TOYE10"
              className={`${inputCls} uppercase`}
            />
            {shareLink && kind === "affiliate" && (
              <p className="text-xs text-muted mt-1 break-all">
                Share link: {shareLink}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Customer discount (%)
            </label>
            <input
              required
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={inputCls}
            />
            {aboveTypical && (
              <p className="text-xs text-amber-700 mt-1">
                Above the usual {TYPICAL_ALLOWANCE}% allowance — double-check
                this is intended.
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted mt-3 leading-relaxed">
          This is what the customer gets off. Applies to prints and Talk Canvas
          Originals only — never to one-of-one artist works. Commission is
          settled with the influencer directly; the site doesn't track it.
        </p>
      </section>

      {statsLink && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
            Private stats link
          </h2>
          <p className="text-sm text-ink-soft mb-2 leading-relaxed">
            Send this to {name || "the influencer"}. It needs no login — anyone
            with the link can view their numbers, so treat it as private.
          </p>
          <code className="block text-xs bg-paper border border-line p-3 break-all">
            {statsLink}
          </code>
        </section>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          {kind === "promo" ? "Label" : "Influencer"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-soft mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Notes
              <span className="text-muted ml-1">
                (e.g. agreed commission — for your reference only)
              </span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Validity
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Expires on
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-56 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
            <p className="text-xs text-muted mt-1">
              Leave blank for no expiry.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-ink"
            />
            <span>Active</span>
            <span className="text-xs text-muted">
              (uncheck to switch the code off immediately)
            </span>
          </label>
          <p className="text-xs text-muted">
            Each code can be used once per customer email address.
          </p>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-line">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-4 bg-ink text-cream uppercase text-xs tracking-[0.15em] hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Create code"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/affiliates")}
          className="px-8 py-4 border border-line text-ink-soft uppercase text-xs tracking-[0.15em] hover:bg-paper transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
