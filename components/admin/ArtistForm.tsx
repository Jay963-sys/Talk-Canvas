"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/utils";
import type { Artist } from "@/lib/db/schema";

const inputCls =
  "w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none";

export default function ArtistForm({ artist }: { artist?: Artist }) {
  const router = useRouter();
  const isEdit = !!artist;

  const [name, setName] = useState(artist?.name ?? "");
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [location, setLocation] = useState(artist?.location ?? "");
  const [instagram, setInstagram] = useState(artist?.instagram ?? "");
  const [website, setWebsite] = useState(artist?.website ?? "");

  // Portrait
  const [portraitUrl, setPortraitUrl] = useState(artist?.portraitUrl ?? "");
  const [portraitPublicId, setPortraitPublicId] = useState(
    artist?.portraitPublicId ?? "",
  );

  // Status
  const [featured, setFeatured] = useState(artist?.featured ?? false);
  const [isVisible, setIsVisible] = useState(artist?.isVisible ?? true);
  const [displayOrder, setDisplayOrder] = useState(
    String(artist?.displayOrder ?? 0),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      bio: bio.trim() || null,
      location: location.trim() || null,
      instagram: instagram.trim() || null,
      website: website.trim() || null,
      portraitUrl: portraitUrl || null,
      portraitPublicId: portraitPublicId || null,
      featured,
      isVisible,
      displayOrder: parseInt(displayOrder) || 0,
    };

    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/artists/${artist.id}`
        : "/api/admin/artists";
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

      router.push("/admin/artists");
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
                URL: /artists/{slug || "…"}
              </p>
            </div>
            <div>
              <label className="block text-sm text-ink-soft mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lagos, Nigeria"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Portrait */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Portrait
        </h2>
        <ImageUploader
          value={
            portraitUrl
              ? { url: portraitUrl, publicId: portraitPublicId }
              : null
          }
          onChange={(img) => {
            setPortraitUrl(img?.url || "");
            setPortraitPublicId(img?.publicId || "");
          }}
        />
      </section>

      {/* Links */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Links
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@handle or full URL"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
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
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-ink"
            />
            <span>Featured</span>
            <span className="text-xs text-muted">
              (shown in Popular Artists)
            </span>
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
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Create artist"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/artists")}
          className="px-8 py-4 border border-line text-ink-soft uppercase text-xs tracking-[0.15em] hover:bg-paper transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
