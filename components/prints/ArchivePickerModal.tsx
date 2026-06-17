"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

export interface ArchiveItem {
  id: number;
  imageUrl: string;
  imagePublicId: string;
  width: number;
  height: number;
}

interface Props {
  onSelect: (item: ArchiveItem) => void;
  onClose: () => void;
}

function thumb(url: string, width = 500) {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function ArchivePickerModal({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinel = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  const load = useCallback(
    async (cur?: number | null) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const qs = cur ? `?cursor=${cur}` : "";
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/80">
      <div
        className="
          absolute inset-0
          bg-cream
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
              onClick={onClose}
              className="p-2 hover:text-accent transition-colors"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
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
                New designs are added all the time — check back soon.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group mb-4 block w-full break-inside-avoid overflow-hidden bg-paper"
                  style={{ aspectRatio: `${item.width}/${item.height}` }}
                >
                  <img
                    src={thumb(item.imageUrl)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>
              ))}
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

        {/* Mobile close bar — pinned to bottom, never scrolls away */}
        <div className="md:hidden shrink-0 border-t border-line bg-cream">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-4 text-sm uppercase tracking-[0.12em] hover:text-accent transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
