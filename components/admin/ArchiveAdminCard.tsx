"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2, Expand, Unlink } from "lucide-react";
import {
  ARCHIVE_CATEGORIES,
  DEFAULT_ARCHIVE_CATEGORY,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";
import AdminLightbox from "./AdminLightbox";

export interface AdminArchiveItem {
  id: number;
  imageUrl: string;
  isVisible: boolean;
  orientation: string;
  collection?: string | null;
  setId?: number | null;
  setPosition?: number | null;
  setSize?: number | null;
}

interface Props {
  item: AdminArchiveItem;
  /** Grid-wide selection mode — suppresses the normal per-card controls. */
  selecting?: boolean;
  /** Position in the current selection, or -1. Doubles as the hanging order. */
  selectedIndex?: number;
  onToggleSelect?: (id: number) => void;
}

function thumb(url: string, width = 500): string {
  // c_limit, not c_fill — a cropped square thumbnail hides the composition,
  // which is the thing staff are checking when they open the grid.
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

/**
 * A loose print in the admin grid.
 *
 * Set panels normally arrive here grouped into ArchiveAdminSetCard instead, so
 * the set branches below are a fallback for a panel that reaches the grid
 * without its siblings — it still has to be viewable and ungroupable rather
 * than stranded.
 */
export default function ArchiveAdminCard({
  item,
  selecting = false,
  selectedIndex = -1,
  onToggleSelect,
}: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(item.isVisible);
  const [category, setCategory] = useState<ArchiveCategory>(
    isArchiveCategory(item.collection)
      ? item.collection
      : DEFAULT_ARCHIVE_CATEGORY,
  );
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [preview, setPreview] = useState(false);

  const inSet = item.setId != null;
  const selected = selectedIndex >= 0;
  // Already-grouped pieces can't join another set, so they're inert while
  // selecting rather than offering an action that would be rejected.
  const selectable = selecting && !inSet;

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/archive-prints/${item.id}`, {
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
      // Visibility moves as a unit for a set — refresh so its other panels
      // don't sit on screen showing the old state.
      if (inSet) router.refresh();
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
      if (inSet) router.refresh();
    } catch {
      setCategory(previous);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const message = inSet
      ? `This piece belongs to a set of ${item.setSize ?? "?"}. Deleting it removes the whole set — a partial set can't be sold. Continue?`
      : "Remove this print from the archive? This can't be undone.";
    if (!confirm(message)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/archive-prints/${item.id}`, {
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
      const res = await fetch(`/api/admin/archive-sets/${item.setId}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={visible ? undefined : "opacity-60"}>
        <button
          type="button"
          onClick={() =>
            selectable ? onToggleSelect?.(item.id) : setPreview(true)
          }
          disabled={selecting && !selectable}
          aria-label={
            selectable
              ? selected
                ? "Remove from selection"
                : "Add to selection"
              : "View design full size"
          }
          aria-pressed={selectable ? selected : undefined}
          className={`group relative block w-full overflow-hidden bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            selected ? "ring-2 ring-ink" : "border border-line"
          } ${selecting && !selectable ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb(item.imageUrl)}
            alt=""
            loading="lazy"
            className="w-full h-auto block"
          />

          {!selecting && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
              <span className="bg-cream/90 p-2.5 rounded-full">
                <Expand size={16} strokeWidth={1.5} />
              </span>
            </span>
          )}

          {/* The number IS the hanging order, so it has to be visible while
              picking — otherwise staff can't tell which panel goes left. */}
          {selected && (
            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink text-cream text-xs flex items-center justify-center tabular-nums">
              {selectedIndex + 1}
            </span>
          )}

          {!visible && (
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-ink text-cream px-2 py-0.5">
              Hidden
            </span>
          )}

          {inSet && (
            <span className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wide bg-ink text-cream px-2 py-0.5">
              Set · {item.setPosition ?? "?"} of {item.setSize ?? "?"}
            </span>
          )}

          <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wide bg-cream/90 text-ink px-2 py-0.5">
            {item.orientation}
          </span>
        </button>

        {/* Editing controls stay out of the way while picking pieces. */}
        {!selecting && (
          <>
            <label className="sr-only" htmlFor={`category-${item.id}`}>
              Category
            </label>
            <select
              id={`category-${item.id}`}
              value={category}
              disabled={busy}
              onChange={(e) =>
                changeCategory(e.target.value as ArchiveCategory)
              }
              className="mt-2 w-full border border-line bg-paper px-2 py-1.5 text-xs disabled:opacity-60"
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

              {inSet && (
                <button
                  onClick={ungroup}
                  disabled={busy}
                  title="Ungroup this set"
                  aria-label="Ungroup this set"
                  className="flex items-center justify-center border border-line p-1.5 text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-60"
                >
                  <Unlink size={14} strokeWidth={1.5} />
                </button>
              )}

              <button
                onClick={remove}
                disabled={busy}
                aria-label="Delete print"
                className="ml-auto flex items-center justify-center border border-line p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            {inSet && (
              <p className="text-[11px] text-ink-soft mt-1.5">
                Category and visibility apply to the whole set.
              </p>
            )}

            {saveError && (
              <p className="text-[11px] text-red-600 mt-1">
                Couldn&apos;t save — try again.
              </p>
            )}
          </>
        )}
      </div>

      {preview && (
        <AdminLightbox
          images={[item.imageUrl]}
          onClose={() => setPreview(false)}
        />
      )}
    </>
  );
}
