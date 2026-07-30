"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2, Unlink, Layers } from "lucide-react";
import {
  ARCHIVE_CATEGORIES,
  DEFAULT_ARCHIVE_CATEGORY,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";
import AdminLightbox from "./AdminLightbox";
import type { AdminArchiveItem } from "./ArchiveAdminCard";

function thumb(url: string, width = 500): string {
  // c_limit, not c_fill — a cropped square thumbnail hides the composition,
  // which is the thing staff are checking when they open the grid.
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

interface Props {
  setId: number;
  /** Every panel, already in hanging order. */
  panels: AdminArchiveItem[];
  /** Grid-wide selection mode — a grouped set can't join another set. */
  selecting?: boolean;
}

/**
 * A whole set as one block in the admin grid.
 *
 * Before this, panels were separate tiles scattered through a masonry of
 * hundreds — a badge told staff a piece was part of a set of three but not
 * where the other two were, so checking or fixing a grouping meant scrolling
 * and matching by eye. The block is also the honest shape for the mutations:
 * category, visibility, ungroup and delete already apply set-wide server-side,
 * so showing one control per set instead of three identical ones removes the
 * implication that a panel can be changed on its own.
 */
export default function ArchiveAdminSetCard({
  setId,
  panels,
  selecting = false,
}: Props) {
  const router = useRouter();

  // Position 1 is canonical: it carries the set's category and visibility, and
  // the per-print endpoints fan out from it to the rest.
  const canonical = panels.find((p) => p.setPosition === 1) ?? panels[0];

  const [visible, setVisible] = useState(canonical.isVisible);
  const [category, setCategory] = useState<ArchiveCategory>(
    isArchiveCategory(canonical.collection)
      ? canonical.collection
      : DEFAULT_ARCHIVE_CATEGORY,
  );
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const size = panels.length;
  const images = panels.map((p) => p.imageUrl);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/archive-prints/${canonical.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Save failed");
  };

  const toggle = async () => {
    setBusy(true);
    try {
      await patch({ isVisible: !visible });
      setVisible(!visible);
    } catch {
      /* leave the toggle where it was */
    } finally {
      setBusy(false);
    }
  };

  const changeCategory = async (next: ArchiveCategory) => {
    const previous = category;
    setCategory(next);
    setSaveError(false);
    setBusy(true);
    try {
      await patch({ category: next });
      // The category tabs above carry counts, and a set moving between
      // categories changes two of them.
      router.refresh();
    } catch {
      setCategory(previous);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (
      !confirm(
        `Delete this whole set of ${size}? Every piece goes — a partial set can't be sold. This can't be undone.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/archive-prints/${canonical.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const ungroup = async () => {
    if (
      !confirm(
        "Ungroup this set? The pieces stay in the archive as separate prints.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/archive-sets/${setId}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className={`border border-ink/25 bg-paper/40 p-3 ${
          visible ? "" : "opacity-60"
        } ${selecting ? "opacity-40" : ""}`}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Layers size={14} strokeWidth={1.5} className="text-ink-soft" />
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">
            Set of {size}
          </span>
          {!visible && (
            <span className="text-[10px] uppercase tracking-wide bg-ink text-cream px-2 py-0.5">
              Hidden
            </span>
          )}
          <span className="ml-auto text-[10px] uppercase tracking-wide text-ink-soft">
            {canonical.orientation}
          </span>
        </div>

        {/* Panels in hanging order, left to right — the same order the
            customer sees, so a wrong grouping is visible at a glance instead
            of needing a trip to the public page. */}
        <div className="flex items-start gap-2">
          {panels.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpenAt(i)}
              disabled={selecting}
              aria-label={`View piece ${i + 1} of ${size} full size`}
              className="group relative flex-1 min-w-0 overflow-hidden border border-line bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(p.imageUrl, 400)}
                alt=""
                loading="lazy"
                className="w-full h-auto block"
              />
              <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-ink text-cream text-[11px] flex items-center justify-center tabular-nums">
                {p.setPosition ?? i + 1}
              </span>
            </button>
          ))}
        </div>

        {!selecting && (
          <>
            <label className="sr-only" htmlFor={`set-category-${setId}`}>
              Category for this set
            </label>
            <select
              id={`set-category-${setId}`}
              value={category}
              disabled={busy}
              onChange={(e) =>
                changeCategory(e.target.value as ArchiveCategory)
              }
              className="mt-3 w-full border border-line bg-paper px-2 py-1.5 text-xs disabled:opacity-60"
            >
              {ARCHIVE_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={toggle}
                disabled={busy}
                className="flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-xs text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : visible ? (
                  <Eye size={14} strokeWidth={1.5} />
                ) : (
                  <EyeOff size={14} strokeWidth={1.5} />
                )}
                {visible ? "Visible" : "Hidden"}
              </button>

              <button
                onClick={ungroup}
                disabled={busy}
                title="Ungroup this set"
                aria-label="Ungroup this set"
                className="flex items-center justify-center border border-line p-1.5 text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-60"
              >
                <Unlink size={14} strokeWidth={1.5} />
              </button>

              <button
                onClick={remove}
                disabled={busy}
                aria-label={`Delete this set of ${size}`}
                className="ml-auto flex items-center justify-center border border-line p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-[11px] text-ink-soft mt-1.5">
              Category, visibility and deletion apply to all {size} pieces.
            </p>

            {saveError && (
              <p className="text-[11px] text-red-600 mt-1">
                Couldn&apos;t save — try again.
              </p>
            )}
          </>
        )}
      </div>

      {openAt !== null && (
        <AdminLightbox
          images={images}
          startIndex={openAt}
          label={`Set of ${size}`}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
