"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";
import type { Original } from "@/lib/db/schema";

type FrameType = "floating" | "box" | "antique";
type FrameColor = "black" | "brown" | "gold" | "white";

const FRAME_TYPES: { value: FrameType; label: string }[] = [
  { value: "floating", label: "Floating" },
  { value: "box", label: "Box" },
  { value: "antique", label: "Antique" },
];

const FRAME_COLORS: { value: FrameColor; label: string; hex: string }[] = [
  { value: "black", label: "Black", hex: "#1a1a1a" },
  { value: "brown", label: "Brown", hex: "#5a3a1f" },
  { value: "gold", label: "Gold", hex: "#b8860b" },
  { value: "white", label: "White", hex: "#f5f0e8" },
];

// UI frame type ↔ schema frame style/shape mapping
function frameTypeToStyle(type: FrameType): {
  style: "regular" | "antique";
  shape: "floating" | "box" | null;
} {
  if (type === "antique") return { style: "antique", shape: null };
  return { style: "regular", shape: type };
}

function styleToFrameType(style: string, shape: string | null): FrameType {
  if (style === "antique") return "antique";
  return shape === "box" ? "box" : "floating";
}

const inputCls =
  "w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

export default function OriginalForm({ original }: { original?: Original }) {
  const router = useRouter();
  const isEdit = !!original;

  // Details
  const [title, setTitle] = useState(original?.title ?? "");
  const [slug, setSlug] = useState(original?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [artist, setArtist] = useState(original?.artist ?? "");
  const [artistId, setArtistId] = useState<string>(
    original?.artistId != null ? String(original.artistId) : "",
  );
  const [artistOptions, setArtistOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [year, setYear] = useState(
    String(original?.year ?? new Date().getFullYear()),
  );
  const [medium, setMedium] = useState(original?.medium ?? "");
  const [description, setDescription] = useState(original?.description ?? "");

  // Image
  const [imageUrl, setImageUrl] = useState(original?.imageUrl ?? "");
  const [imagePublicId, setImagePublicId] = useState(
    original?.imagePublicId ?? "",
  );

  // Dimensions
  const [widthInches, setWidthInches] = useState(
    original?.widthInches != null ? String(original.widthInches) : "",
  );
  const [heightInches, setHeightInches] = useState(
    original?.heightInches != null ? String(original.heightInches) : "",
  );

  // Price (NGN integer)
  const [price, setPrice] = useState(
    original?.price != null ? String(original.price) : "",
  );

  // Frame
  const [frameType, setFrameType] = useState<FrameType>(
    original
      ? styleToFrameType(original.frameStyle, original.frameShape)
      : "floating",
  );
  const [frameColor, setFrameColor] = useState<FrameColor>(
    (original?.frameColor as FrameColor) ?? "black",
  );
  const [glass, setGlass] = useState(original?.glass ?? false);

  // Status
  const [isSold, setIsSold] = useState(!!original?.soldAt);
  const [isVisible, setIsVisible] = useState(original?.isVisible ?? true);
  const [displayOrder, setDisplayOrder] = useState(
    String(original?.displayOrder ?? 0),
  );

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load artist options for the select
  useEffect(() => {
    let active = true;
    fetch("/api/admin/artists")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: number; name: string }[]) => {
        if (active) setArtistOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Auto-slug from title (only until user manually edits the slug)
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  // Enforce frame rules when frame type changes
  useEffect(() => {
    if (frameType === "floating") {
      setGlass(false);
    } else if (frameType === "antique") {
      setGlass(true);
      if (frameColor === "brown" || frameColor === "white") {
        setFrameColor("black");
      }
    }
  }, [frameType, frameColor]);

  const availableColors =
    frameType === "antique"
      ? FRAME_COLORS.filter((c) => c.value === "black" || c.value === "gold")
      : FRAME_COLORS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("Please upload an image");
      return;
    }

    if (!artistId) {
      setError("Please select an artist");
      return;
    }

    const { style: frameStyle, shape: frameShape } =
      frameTypeToStyle(frameType);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      artist: artist.trim(),
      artistId: artistId ? Number(artistId) : null,
      year: parseInt(year),
      medium: medium.trim(),
      description: description.trim(),
      imageUrl,
      imagePublicId: imagePublicId || null,
      widthInches: parseFloat(widthInches),
      heightInches: parseFloat(heightInches),
      price: parseInt(price),
      frameStyle,
      frameShape,
      frameColor,
      glass,
      soldAt: isSold
        ? original?.soldAt
          ? new Date(original.soldAt).toISOString()
          : new Date().toISOString()
        : null,
      displayOrder: parseInt(displayOrder) || 0,
      isVisible,
    };

    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/originals/${original.id}`
        : "/api/admin/originals";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      {/* Details */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-soft mb-2">Slug</label>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                className={inputCls}
              />
              <p className="text-xs text-muted mt-1">
                URL: /originals/{slug || "…"}
              </p>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Artist</label>
              <select
                required
                value={artistId}
                onChange={(e) => {
                  const val = e.target.value;
                  setArtistId(val);
                  const match = artistOptions.find((a) => String(a.id) === val);
                  if (match) setArtist(match.name);
                }}
                className={inputCls}
              >
                <option value="" disabled>
                  {artistOptions.length ? "Select an artist…" : "Loading…"}
                </option>
                {artistOptions.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">
                Not listed?{" "}
                <a
                  href="/admin/artists/new"
                  target="_blank"
                  className="underline hover:text-ink"
                >
                  Add an artist
                </a>
                .
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-soft mb-2">Year</label>
              <input
                required
                type="number"
                min="1800"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">Medium</label>
              <input
                required
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="Oil on canvas"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Image */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Image
        </h2>
        <ImageUploader
          value={imageUrl ? { url: imageUrl, publicId: imagePublicId } : null}
          onChange={(img) => {
            setImageUrl(img?.url || "");
            setImagePublicId(img?.publicId || "");
          }}
        />
      </section>

      {/* Dimensions */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Dimensions
        </h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Width</label>
            <input
              required
              type="number"
              step="0.5"
              min="0"
              value={widthInches}
              onChange={(e) => setWidthInches(e.target.value)}
              className="w-28 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <span className="pb-3 text-muted text-lg">×</span>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Height</label>
            <input
              required
              type="number"
              step="0.5"
              min="0"
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              className="w-28 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <span className="pb-3 text-sm text-muted">inches</span>
        </div>
        <p className="text-xs text-muted mt-2">
          Used for AR sizing and shown alongside the work.
        </p>
      </section>

      {/* Frame */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Frame
        </h2>

        <div className="mb-5">
          <label className="block text-sm text-ink-soft mb-2">Type</label>
          <div className="flex gap-2 flex-wrap">
            {FRAME_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFrameType(t.value)}
                className={`px-4 py-2 border text-sm transition-colors ${
                  frameType === t.value
                    ? "border-ink bg-ink text-cream"
                    : "border-line bg-cream text-ink hover:border-ink-soft"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-ink-soft mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {availableColors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setFrameColor(c.value)}
                className={`flex items-center gap-2 px-3 py-2 border text-sm bg-cream transition-colors ${
                  frameColor === c.value
                    ? "border-ink"
                    : "border-line hover:border-ink-soft"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-line/50"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={glass}
              disabled={frameType === "floating" || frameType === "antique"}
              onChange={(e) => setGlass(e.target.checked)}
              className="accent-ink"
            />
            <span
              className={
                frameType === "floating" || frameType === "antique"
                  ? "text-muted"
                  : "text-ink"
              }
            >
              With glass
            </span>
            {frameType === "floating" && (
              <span className="text-xs text-muted">
                (floating frames don't have glass)
              </span>
            )}
            {frameType === "antique" && (
              <span className="text-xs text-muted">
                (antique frames always include glass)
              </span>
            )}
          </label>
        </div>
      </section>

      {/* Price */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Price
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-muted text-lg">₦</span>
          <input
            required
            type="number"
            min="0"
            step="1000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="450000"
            className="w-48 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
          />
          {price && !isNaN(parseInt(price)) && (
            <span className="text-sm text-muted">
              = ₦{parseInt(price).toLocaleString("en-NG")}
            </span>
          )}
        </div>
      </section>

      {/* Status */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Status
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSold}
              onChange={(e) => setIsSold(e.target.checked)}
              className="accent-ink"
            />
            <span>Mark as sold</span>
            {isSold && original?.soldAt && (
              <span className="text-xs text-muted">
                (sold on{" "}
                {new Date(original.soldAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                )
              </span>
            )}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="accent-ink"
            />
            <span>Visible to public</span>
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
            <p className="text-xs text-muted mt-1">
              Lower = shown first. Top entries feature on the home page.
            </p>
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
              : "Create original"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-8 py-4 border border-line text-ink-soft uppercase text-xs tracking-[0.15em] hover:bg-paper transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
