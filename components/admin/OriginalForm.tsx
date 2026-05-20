"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import type { Original } from "@/lib/db/schema";

interface Props {
  initialData?: Original;
  mode: "create" | "edit";
}

export default function OriginalForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    artist: initialData?.artist ?? "",
    year: initialData?.year ?? new Date().getFullYear(),
    medium: initialData?.medium ?? "",
    size: initialData?.size ?? "",
    price: initialData?.price ?? "",
    description: initialData?.description ?? "",
    displayOrder: initialData?.displayOrder ?? 0,
    isVisible: initialData?.isVisible ?? true,
  });

  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [image, setImage] = useState<{ url: string; publicId: string } | null>(
    initialData?.imageUrl
      ? {
          url: initialData.imageUrl,
          publicId: initialData.imagePublicId ?? "",
        }
      : null,
  );

  const handleTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: autoSlug ? slugify(value) : f.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setForm((f) => ({ ...f, slug: value }));
    setAutoSlug(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Please upload an image");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/originals"
          : `/api/admin/originals/${initialData!.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: image.url,
          imagePublicId: image.publicId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Save failed");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      {/* Image */}
      <section>
        <h2 className="display text-xl mb-4">Image</h2>
        <ImageUploader value={image} onChange={setImage} />
      </section>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="display text-xl">Details</h2>
        <Field
          label="Title"
          value={form.title}
          onChange={handleTitleChange}
          required
        />
        <Field
          label="URL slug"
          value={form.slug}
          onChange={handleSlugChange}
          required
          hint="Used in the public URL: /originals/your-slug"
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Artist"
            value={form.artist}
            onChange={(v) => setForm({ ...form, artist: v })}
            required
          />
          <Field
            label="Year"
            type="number"
            value={String(form.year)}
            onChange={(v) => setForm({ ...form, year: Number(v) })}
            required
          />
        </div>
        <Field
          label="Medium"
          value={form.medium}
          onChange={(v) => setForm({ ...form, medium: v })}
          placeholder="e.g. Oil on canvas"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Dimensions"
            value={form.size}
            onChange={(v) => setForm({ ...form, size: v })}
            placeholder="e.g. 48 × 60 in"
            required
          />
          <Field
            label="Price"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            placeholder="e.g. ₦1,200,000 or Enquire"
            required
          />
        </div>
        <TextareaField
          label="Description"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
          required
        />
      </section>

      {/* Settings */}
      <section className="space-y-4">
        <h2 className="display text-xl">Settings</h2>
        <Field
          label="Display order"
          type="number"
          value={String(form.displayOrder)}
          onChange={(v) => setForm({ ...form, displayOrder: Number(v) })}
          hint="Lower numbers appear first. Use to control order on the gallery page."
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
            className="w-4 h-4 accent-ink"
          />
          <span className="text-sm">Visible on the public site</span>
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-6 border-t border-line">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create original"
              : "Save changes"}
        </button>
        <Link
          href="/admin"
          className="px-8 py-3 border border-line text-sm font-medium hover:border-ink transition-colors flex items-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
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
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none text-[15px]"
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.1em] text-muted mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
        className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none text-[15px] resize-none"
      />
    </div>
  );
}
