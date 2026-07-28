"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ArchiveCard from "./ArchiveCard";
import type { ArchiveCategory } from "@/data/collections";

export interface ArchiveItem {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  collection?: string | null;
  /**
   * Set membership. The feed returns only the leading panel of a set, so a
   * tile with a setId stands for `setSize` framed pieces — ArchiveCard fetches
   * the rest when it's chosen.
   */
  setId?: number | null;
  setSize?: number | null;
}

interface Props {
  initialItems: ArchiveItem[];
  initialCursor: number | null;
  category?: ArchiveCategory;
  orientation?: "portrait" | "landscape";
}

export default function ArchiveGrid({
  initialItems,
  initialCursor,
  category,
  orientation,
}: Props) {
  const [items, setItems] = useState<ArchiveItem[]>(initialItems);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  // Reset the grid whenever either filter changes.
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setError(null);
  }, [initialItems, initialCursor, orientation, category]);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("cursor", String(cursor));
      // Both filters ride along, or page 2 quietly widens back to everything.
      if (category) params.set("category", category);
      if (orientation) params.set("orientation", orientation);
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
  }, [cursor, loading, category, orientation]);

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

  if (items.length === 0) {
    // With two filters live, most empty states are a narrow combination rather
    // than an empty archive — say which, and offer the way out.
    const filtered = Boolean(category || orientation);
    return (
      <div className="border-[1.5px] border-dashed border-line py-24 text-center">
        <p className="display-italic text-2xl">Nothing here yet</p>
        <p className="text-sm text-muted mt-2">
          {filtered
            ? "No designs match this combination of style and shape."
            : "New pieces are added all the time — check back soon."}
        </p>
        {filtered && (
          <Link
            href="/prints/archive"
            scroll={false}
            className="inline-block mt-4 text-sm underline text-ink hover:text-accent"
          >
            Show everything
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {items.map((item) => (
          <ArchiveCard key={item.id} item={item} />
        ))}
      </div>

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

      {cursor !== null && (
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
