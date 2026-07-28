"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { ARCHIVE_CATEGORIES, type ArchiveCategory } from "@/data/collections";

type Orientation = "portrait" | "landscape";

export interface ArchiveItem {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  orientation: Orientation;
  collection: string | null;
  /**
   * Set membership. The feed only returns the leading panel of a set, so a
   * tile with a setId stands for several pieces — StepUpload fetches the rest
   * once it's chosen.
   */
  setId: number | null;
  setSize: number | null;
}

interface Props {
  onSelect: (item: ArchiveItem) => void;
  onClose: () => void;
}

function thumb(url: string, width = 500) {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

const ORIENTATIONS: { id: Orientation | null; label: string }[] = [
  { id: null, label: "All shapes" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

/** The two filters the feed can be narrowed by. Both are optional and combine. */
interface Filters {
  category: ArchiveCategory | null;
  orientation: Orientation | null;
}

const NO_FILTERS: Filters = { category: null, orientation: null };

export default function ArchivePickerModal({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  // Ref mirror so `load` reads the active filters without being re-created
  // (which would re-subscribe the infinite-scroll observer on every change).
  const filtersRef = useRef<Filters>(NO_FILTERS);

  const sentinel = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  // Portal target — mount to <body> so the modal escapes any transformed /
  // filtered ancestor (e.g. `.fade-in`, film-grain filter) that would
  // otherwise trap `position: fixed` inside the page instead of the viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(
    async (cur?: number | null) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (cur) params.set("cursor", String(cur));
        if (filtersRef.current.category) {
          params.set("category", filtersRef.current.category);
        }
        if (filtersRef.current.orientation) {
          params.set("orientation", filtersRef.current.orientation);
        }
        const qs = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`/api/archive-prints${qs}`);

        if (!res.ok) throw new Error("Couldn't load the archive");

        const data: {
          items: ArchiveItem[];
          nextCursor: number | null;
        } = await res.json();

        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
        setLoadedOnce(true);
      }
    },
    [loading],
  );

  /** Change one axis, keep the other, and pull a fresh first page. */
  const applyFilter = (patch: Partial<Filters>) => {
    const next = { ...filtersRef.current, ...patch };
    if (
      next.category === filters.category &&
      next.orientation === filters.orientation
    ) {
      return;
    }
    filtersRef.current = next;
    setFilters(next);
    setItems([]);
    setCursor(null);
    setLoadedOnce(false);
    setError(null);
    load(null);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    if (firstLoad.current) {
      firstLoad.current = false;
      load(null);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [load, onClose]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || cursor === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) load(cursor);
      },
      { root: null, rootMargin: "600px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, load]);

  if (!mounted) return null;

  const filterPill = (active: boolean) =>
    `text-[12px] uppercase tracking-widest whitespace-nowrap pb-1 border-b transition-colors ${
      active
        ? "text-ink border-ink font-medium"
        : "text-ink-soft hover:text-ink border-transparent"
    }`;

  const modal = (
    <div
      className="fixed inset-x-0 top-0 z-[200] h-[100dvh] bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a design from the archive"
      onClick={(e) => {
        // Click on the dark backdrop (not the panel) closes the modal.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          absolute inset-0
          bg-cream text-ink
          flex flex-col

          md:inset-auto
          md:left-1/2
          md:top-1/2
          md:-translate-x-1/2
          md:-translate-y-1/2
          md:w-full
          md:max-w-5xl
          md:h-[90dvh]
          md:shadow-2xl
        "
      >
        {/* Header */}
        <div className="shrink-0 border-b border-line bg-cream">
          <div className="flex items-center justify-between px-6 md:px-8 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted">
                The archive
              </p>
              <h2 className="display text-2xl font-normal mt-1">
                Choose a <span className="display-italic">design</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink bg-cream hover:bg-ink hover:text-cream hover:border-ink transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Filters — style is tagged by the gallery, shape is derived from each
            image. Independent axes, so they combine rather than replace. The
            style row scrolls sideways on narrow screens instead of wrapping the
            panel into a tall header. */}
        <div className="shrink-0 border-b border-line bg-cream px-6 md:px-8">
          <div className="flex gap-x-5 overflow-x-auto py-3 -mx-1 px-1">
            {[{ slug: null, label: "All styles" }, ...ARCHIVE_CATEGORIES].map(
              (c) => {
                const slug = c.slug as ArchiveCategory | null;
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => applyFilter({ category: slug })}
                    className={filterPill(filters.category === slug)}
                  >
                    {c.label}
                  </button>
                );
              },
            )}
          </div>

          <div className="flex gap-x-6 pb-3 border-t border-line pt-3">
            {ORIENTATIONS.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => applyFilter({ orientation: f.id })}
                className={filterPill(filters.orientation === f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {!loadedOnce && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          )}

          {loadedOnce && items.length === 0 && !error && (
            <div className="py-20 text-center">
              <p className="display-italic text-2xl">Nothing here yet</p>
              <p className="text-sm text-muted mt-2">
                {filters.category || filters.orientation
                  ? "No designs match this combination — try another style or shape."
                  : "New designs are added all the time — check back soon."}
              </p>
              {(filters.category || filters.orientation) && (
                <button
                  type="button"
                  onClick={() => applyFilter(NO_FILTERS)}
                  className="mt-4 underline text-sm hover:text-accent"
                >
                  Show everything
                </button>
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {items.map((item) => {
                const panels = item.setId ? (item.setSize ?? 0) : 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    aria-label={
                      panels > 1
                        ? `Choose this set of ${panels}`
                        : "Choose this design"
                    }
                    className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-paper"
                    style={{ aspectRatio: `${item.width}/${item.height}` }}
                  >
                    <img
                      src={thumb(item.imageUrl)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {/* The tile shows one panel, so the badge is the only thing
                        telling a customer they're picking several pieces —
                        and, once priced, several frames. */}
                    {panels > 1 && (
                      <span className="absolute top-2 left-2 bg-ink text-cream text-[10px] uppercase tracking-widest px-2 py-1">
                        Set of {panels}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="text-center mt-6">
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <button
                onClick={() => load(cursor)}
                className="underline text-sm hover:text-accent"
              >
                Try again
              </button>
            </div>
          )}

          {cursor !== null && (
            <div ref={sentinel} className="flex justify-center py-8">
              {loading && (
                <Loader2 className="animate-spin text-accent" size={26} />
              )}
            </div>
          )}
        </div>

        {/* Mobile close bar — pinned to bottom, clears browser chrome / safe area */}
        <div className="md:hidden shrink-0 border-t border-line bg-cream">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-cream transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
