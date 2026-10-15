"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ArchiveCard from "./ArchiveCard";
import {
  ARCHIVE_CATEGORIES,
  isArchiveCategory,
  type ArchiveCategory,
} from "@/data/collections";
import type { ArchiveOrientation } from "@/lib/db/queries/archivePrints";

export interface ArchivePanel {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  setPosition: number;
}

export interface ArchiveItem {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  collection?: string | null;
  setId?: number | null;
  setSize?: number | null;
  panels?: ArchivePanel[];
}

export type CountsByOrientation = {
  all: Record<string, number>;
  portrait: Record<string, number>;
  landscape: Record<string, number>;
};

const ORIENTATIONS: { id: ArchiveOrientation | null; label: string }[] = [
  { id: null, label: "All shapes" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

export const ARCHIVE_DENSITIES = [
  {
    label: "Large tiles",
    bars: 2,
    grid: "columns-2 md:columns-3 lg:columns-4 gap-4",
    spacing: "mb-4",
  },
  {
    label: "Medium tiles",
    bars: 3,
    grid: "columns-3 md:columns-4 lg:columns-5 gap-2 md:gap-3",
    spacing: "mb-2 md:mb-3",
  },
  {
    label: "Small tiles",
    bars: 4,
    grid: "columns-4 md:columns-5 lg:columns-6 gap-1.5 md:gap-2",
    spacing: "mb-1.5 md:mb-2",
  },
] as const;

export type ArchiveDensity = 0 | 1 | 2;

const DENSITY_KEY = "tc_archive_density";

function ColumnsIcon({ n }: { n: number }) {
  const gap = 1.5;
  const w = (16 - gap * (n - 1)) / n;
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={i * (w + gap)}
          y="0"
          width={w}
          height="14"
          rx="0.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

interface Props {
  initialItems: ArchiveItem[];
  initialCursor: number | null;
  countsByOrientation?: CountsByOrientation;
  /** Restrict the feed to sets — used by /prints/sets. */
  setsOnly?: boolean;
  /** Note rendered between the filter bar and the grid */
  materialsNote?: string;
}

export default function ArchiveGrid({
  initialItems,
  initialCursor,
  countsByOrientation,
  setsOnly,
  materialsNote,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filters from URL (if user landed on a shared link like ?category=abstract)
  const rawCat = searchParams.get("category");
  const urlCategory: ArchiveCategory | undefined =
    !setsOnly && isArchiveCategory(rawCat) ? rawCat : undefined;

  const rawOri = searchParams.get("orientation");
  const urlOrientation: ArchiveOrientation | undefined =
    rawOri === "portrait" || rawOri === "landscape" ? rawOri : undefined;

  const [category, setCategory] = useState<ArchiveCategory | undefined>(
    urlCategory,
  );
  const [orientation, setOrientation] = useState<
    ArchiveOrientation | undefined
  >(urlOrientation);

  const [items, setItems] = useState<ArchiveItem[]>(initialItems);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const [density, setDensity] = useState<ArchiveDensity>(0);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(DENSITY_KEY));
      if (saved === 1 || saved === 2) setDensity(saved);
    } catch {
      // Storage blocked
    }
  }, []);

  const chooseDensity = (d: ArchiveDensity) => {
    setDensity(d);
    try {
      localStorage.setItem(DENSITY_KEY, String(d));
    } catch {
      // Ignore
    }
  };
  const layout = ARCHIVE_DENSITIES[density];

  // Fetch page 1 for a given filter combination
  const fetchFilteredFirstPage = useCallback(
    async (
      nextCat: ArchiveCategory | undefined,
      nextOri: ArchiveOrientation | undefined,
    ) => {
      // If returning to unfiltered default state, restore static initialItems immediately!
      if (!nextCat && !nextOri) {
        setItems(initialItems);
        setCursor(initialCursor);
        setError(null);
        return;
      }

      setFiltering(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (nextCat) params.set("category", nextCat);
        if (nextOri) params.set("orientation", nextOri);
        if (setsOnly) params.set("setsOnly", "1");

        const res = await fetch(`/api/archive-prints?${params.toString()}`);
        if (!res.ok) throw new Error("Couldn't load pieces");
        const data: { items: ArchiveItem[]; nextCursor: number | null } =
          await res.json();
        setItems(data.items);
        setCursor(data.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setFiltering(false);
      }
    },
    [initialItems, initialCursor, setsOnly],
  );

  // If the user landed directly on a URL with ?category=... or ?orientation=..., load it on mount
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (urlCategory || urlOrientation) {
        fetchFilteredFirstPage(urlCategory, urlOrientation);
      }
    }
  }, [urlCategory, urlOrientation, fetchFilteredFirstPage]);

  // Handle filter selection + shallow URL update
  const applyFilters = (
    nextCat: ArchiveCategory | undefined,
    nextOri: ArchiveOrientation | undefined,
  ) => {
    if (nextCat === category && nextOri === orientation) return;
    setCategory(nextCat);
    setOrientation(nextOri);

    const params = new URLSearchParams();
    if (nextCat) params.set("category", nextCat);
    if (nextOri) params.set("orientation", nextOri);
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    window.history.pushState(null, "", newUrl);

    fetchFilteredFirstPage(nextCat, nextOri);
  };

  const loadMore = useCallback(async () => {
    if (loading || filtering || cursor === null) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("cursor", String(cursor));
      if (category) params.set("category", category);
      if (orientation) params.set("orientation", orientation);
      if (setsOnly) params.set("setsOnly", "1");
      const res = await fetch(`/api/archive-prints?${params.toString()}`);
      if (!res.ok) throw new Error("Couldn't load more pieces");
      const data: { items: ArchiveItem[]; nextCursor: number | null } =
        await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, filtering, category, orientation, setsOnly]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || cursor === null) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, cursor]);

  const activeCounts = countsByOrientation
    ? countsByOrientation[orientation ?? "all"]
    : undefined;
  const total = activeCounts
    ? Object.values(activeCounts).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <>
      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div className="border-b border-line mb-12">
        {/* Style (Archive only) */}
        {!setsOnly && countsByOrientation && (
          <div className="flex items-baseline justify-center gap-x-3 mb-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted shrink-0 hidden sm:block">
              Style
            </span>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-3">
              {[{ slug: null, label: "All styles" }, ...ARCHIVE_CATEGORIES].map(
                (c) => {
                  const slug = c.slug as ArchiveCategory | null;
                  const active = (category ?? null) === slug;
                  const count = slug ? (activeCounts?.[slug] ?? 0) : total;
                  const empty = count === 0 && !active;

                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() =>
                        applyFilters(slug ?? undefined, orientation)
                      }
                      aria-current={active ? "page" : undefined}
                      className={`text-[12px] uppercase tracking-widest pb-0.5 border-b transition-colors ${
                        active
                          ? "text-ink border-ink font-medium"
                          : empty
                            ? "text-muted border-transparent hover:text-ink-soft"
                            : "text-ink-soft hover:text-ink border-transparent"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Shape */}
        <div className="flex items-baseline justify-center gap-x-3">
          {!setsOnly && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted shrink-0 hidden sm:block">
              Shape
            </span>
          )}
          <div className="flex justify-center gap-x-6 py-3">
            {ORIENTATIONS.map((f) => {
              const active = (orientation ?? null) === f.id;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => applyFilters(category, f.id ?? undefined)}
                  aria-current={active ? "page" : undefined}
                  className={`text-[12px] uppercase tracking-widest pb-1 border-b -mb-[13px] transition-colors ${
                    active
                      ? "text-ink border-ink font-medium"
                      : "text-ink-soft hover:text-ink border-transparent"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Materials Note */}
      {materialsNote && (
        <div className="bg-paper rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto text-center">
          <p className="text-[14px] text-ink-soft leading-relaxed">
            {materialsNote}
          </p>
        </div>
      )}

      {/* Grid Content */}
      {filtering ? (
        <div className="flex justify-center py-24">
          <Loader2
            className="animate-spin text-accent"
            size={28}
            strokeWidth={1.5}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-line py-24 text-center">
          <p className="display-italic text-2xl">Nothing here yet</p>
          <p className="text-sm text-muted mt-2">
            {setsOnly
              ? orientation
                ? "No sets in this shape yet."
                : "No sets in the archive yet — check back soon."
              : category || orientation
                ? "No designs match this combination of style and shape."
                : "New pieces are added all the time — check back soon."}
          </p>
          {(category || orientation) && (
            <button
              type="button"
              onClick={() => applyFilters(undefined, undefined)}
              className="inline-block mt-4 text-sm underline text-ink hover:text-accent"
            >
              Show everything
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label="Tile size"
            className="flex justify-end items-center gap-1 mb-4"
          >
            <span className="text-[10px] uppercase tracking-widest text-ink-soft mr-2">
              View
            </span>
            {ARCHIVE_DENSITIES.map((d, i) => (
              <button
                key={d.label}
                type="button"
                onClick={() => chooseDensity(i as ArchiveDensity)}
                aria-label={d.label}
                aria-pressed={density === i}
                title={d.label}
                className={`p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  density === i
                    ? "text-ink"
                    : "text-ink-soft/50 hover:text-ink-soft"
                }`}
              >
                <ColumnsIcon n={d.bars} />
              </button>
            ))}
          </div>

          <div className={layout.grid}>
            {items.map((item) => (
              <ArchiveCard
                key={item.id}
                item={item}
                density={density}
                spacing={layout.spacing}
              />
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="text-center mt-8">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={loadMore}
            className="text-sm underline text-ink hover:text-accent"
          >
            Try again
          </button>
        </div>
      )}

      {cursor !== null && !filtering && (
        <div ref={sentinel} className="flex justify-center py-12">
          {loading && (
            <Loader2
              className="animate-spin text-accent"
              size={28}
              strokeWidth={1.5}
            />
          )}
        </div>
      )}
    </>
  );
}
