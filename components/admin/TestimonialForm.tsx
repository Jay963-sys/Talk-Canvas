"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Testimonial } from "@/lib/db/schema";

const inputCls =
  "w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

export default function TestimonialForm({
  testimonial,
}: {
  testimonial?: Testimonial;
}) {
  const router = useRouter();
  const isEdit = !!testimonial;

  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [name, setName] = useState(testimonial?.name ?? "");
  const [location, setLocation] = useState(testimonial?.location ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);

  const [imageUrl, setImageUrl] = useState(testimonial?.imageUrl ?? "");
  const [imagePublicId, setImagePublicId] = useState(
    testimonial?.imagePublicId ?? "",
  );

  const [isVisible, setIsVisible] = useState(testimonial?.isVisible ?? true);
  const [displayOrder, setDisplayOrder] = useState(
    String(testimonial?.displayOrder ?? 0),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/testimonials/${testimonial.id}`
          : "/api/admin/testimonials",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote: quote.trim(),
            name: name.trim(),
            location: location.trim() || null,
            rating,
            imageUrl: imageUrl || null,
            imagePublicId: imagePublicId || null,
            displayOrder: parseInt(displayOrder) || 0,
            isVisible,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          The review
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Quote</label>
            <textarea
              required
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="What the customer said…"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-muted mt-1">
              Quotation marks are added automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm text-ink-soft mb-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-1 text-ink hover:scale-110 transition-transform"
                >
                  <Star
                    size={20}
                    fill={n <= rating ? "currentColor" : "none"}
                    strokeWidth={n <= rating ? 0 : 1.5}
                    className={n <= rating ? "text-ink" : "text-line"}
                  />
                </button>
              ))}
              <span className="text-xs text-muted ml-2">{rating} / 5</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-soft mb-2">Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Folake A."
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lagos"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Wall photo
          <span className="normal-case tracking-normal text-muted ml-1">
            (optional)
          </span>
        </h2>
        <ImageUploader
          value={imageUrl ? { url: imageUrl, publicId: imagePublicId } : null}
          onChange={(img) => {
            setImageUrl(img?.url || "");
            setImagePublicId(img?.publicId || "");
          }}
        />
        <p className="text-xs text-muted mt-3 leading-relaxed">
          A customer photo of the piece hanging in their space. Reviews with a
          photo are shown larger and appear first — they&apos;re the strongest
          proof you have.
        </p>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Status
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="accent-ink"
            />
            <span>Visible on the site</span>
          </label>
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Display order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-32 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
            <p className="text-xs text-muted mt-1">Lower = shown first.</p>
          </div>
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
          {submitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Add testimonial"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="px-8 py-4 border border-line text-ink-soft uppercase text-xs tracking-[0.15em] hover:bg-paper transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
