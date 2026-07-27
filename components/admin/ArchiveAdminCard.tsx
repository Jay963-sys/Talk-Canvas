"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2, Expand, X } from "lucide-react";
import {
  ARCHIVE_CATEGORIES,
  DEFAULT_ARCHIVE_CATEGORY,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";

interface Props {
  item: {
    id: number;
    imageUrl: string;
    isVisible: boolean;
    orientation: string;
    collection?: string | null;
  };
}

function thumb(url: string, width = 500): string {
  // c_limit, not c_fill — a cropped square thumbnail hides the composition,
  // which is the thing staff are checking when they open the grid.
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

function full(url: string, width = 1600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

/**
 * Full-size view of one design. Portaled to <body> to escape any transformed
 * ancestor, matching the AR and picker modals.
 */
function Lightbox({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Design preview"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-cream/90 text-ink hover:bg-cream"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={full(imageUrl)}
        alt=""
        className="max-w-full max-h-[90dvh] object-contain"
      />
    </div>,
    document.body,
  );
}

export default function ArchiveAdminCard({ item }: Props) {
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
    } catch {
      setCategory(previous);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Remove this print from the archive? This can't be undone."))
      return;
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

  return (
    <>
      <div className={visible ? undefined : "opacity-60"}>
        {/*
          The image is now just the image — tapping it opens the design at full
          size instead of revealing a control scrim. Controls live in their own
          row below, so they behave identically on touch and desktop and never
          sit on top of the artwork staff are trying to check.

          Natural aspect ratio, not a forced square: a landscape design cropped
          to a square in the admin grid is part of what made it unreviewable.
        */}
        <button
          type="button"
          onClick={() => setPreview(true)}
          aria-label="View design full size"
          className="group relative block w-full overflow-hidden border border-line bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb(item.imageUrl)}
            alt=""
            loading="lazy"
            className="w-full h-auto block"
          />

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
            <span className="bg-cream/90 p-2.5 rounded-full">
              <Expand size={16} strokeWidth={1.5} />
            </span>
          </span>

          {!visible && (
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-ink text-cream px-2 py-0.5">
              Hidden
            </span>
          )}

          {/* Orientation is read from the image, so it's shown as a fact, not a
              control — staff can confirm it's right without fighting it. */}
          <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wide bg-cream/90 text-ink px-2 py-0.5">
            {item.orientation}
          </span>
        </button>

        {/* Category is editable any time after upload — batches get misfiled,
            and reopening an upload form to fix one image is friction. */}
        <label className="sr-only" htmlFor={`category-${item.id}`}>
          Category
        </label>
        <select
          id={`category-${item.id}`}
          value={category}
          disabled={busy}
          onChange={(e) => changeCategory(e.target.value as ArchiveCategory)}
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

          <button
            onClick={remove}
            disabled={busy}
            aria-label="Delete print"
            className="ml-auto flex items-center justify-center border border-line p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </div>

        {saveError && (
          <p className="text-[11px] text-red-600 mt-1">
            Couldn&apos;t save — try again.
          </p>
        )}
      </div>

      {preview && (
        <Lightbox imageUrl={item.imageUrl} onClose={() => setPreview(false)} />
      )}
    </>
  );
}
