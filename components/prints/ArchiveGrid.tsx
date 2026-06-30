"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import ArchiveCard from "./ArchiveCard";

export interface ArchiveItem {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
  collection?: string | null;
}

interface Props {
  initialItems: ArchiveItem[];
  initialCursor: number | null;
  collection?: string;
}

export default function ArchiveGrid({
  initialItems,
  initialCursor,
  collection,
}: Props) {
  const [items, setItems] = useState<ArchiveItem[]>(initialItems);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  // Reset the grid whenever the selected collection changes.
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setError(null);
  }, [initialItems, initialCursor]);

  const loadMore = useCallback(async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ cursor: String(cursor) });
      if (collection) params.set("collection", collection);
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
  }, [cursor, loading, collection]);

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
    return (
      <div className="border-[1.5px] border-dashed border-line py-24 text-center">
        <p className="display-italic text-2xl">Nothing here yet</p>
        <p className="text-sm text-muted mt-2">
          New pieces are added all the time — check back soon.
        </p>
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
