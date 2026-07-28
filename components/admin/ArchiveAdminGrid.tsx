"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Layers, X } from "lucide-react";
import ArchiveAdminCard, { type AdminArchiveItem } from "./ArchiveAdminCard";

interface Props {
  items: AdminArchiveItem[];
}

export default function ArchiveAdminGrid({ items }: Props) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  // An ARRAY, not a Set: click order is hanging order, so the first piece
  // picked becomes the left-hand panel. A Set would silently reorder them.
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );

  const toggle = (id: number) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const exitSelecting = () => {
    setSelecting(false);
    setSelected([]);
    setError(null);
  };

  // Checked here as well as server-side so staff get the reason before they
  // commit, not as a rejection afterwards.
  const orientations = new Set(
    selected.map((id) => byId.get(id)?.orientation).filter(Boolean),
  );
  const mixedOrientation = orientations.size > 1;
  const canGroup = selected.length >= 2 && !mixedOrientation;

  const group = async () => {
    if (!canGroup) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/archive-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't group those pieces.");
      }
      exitSelecting();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {!selecting ? (
          <button
            onClick={() => setSelecting(true)}
            className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm hover:border-ink transition-colors"
          >
            <Layers size={16} strokeWidth={1.5} />
            Group pieces into a set
          </button>
        ) : (
          <>
            <span className="text-sm text-ink-soft">
              {selected.length === 0
                ? "Tap pieces in the order they hang, left to right."
                : `${selected.length} selected`}
            </span>
            <button
              onClick={group}
              disabled={!canGroup || busy}
              className="inline-flex items-center gap-2 bg-ink text-cream px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              Create set of {selected.length || 0}
            </button>
            <button
              onClick={exitSelecting}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
            >
              <X size={14} strokeWidth={1.5} />
              Cancel
            </button>
          </>
        )}
      </div>

      {selecting && mixedOrientation && (
        <p className="text-[13px] text-amber-800 bg-amber-50/60 border border-amber-300 px-4 py-3 mb-6">
          Those pieces aren&apos;t all the same shape. A set takes one frame and
          one size, so every piece has to be portrait or every piece landscape.
        </p>
      )}

      {error && (
        <p className="text-[13px] text-red-600 border border-red-300 bg-red-50/60 px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <ArchiveAdminCard
              item={item}
              selecting={selecting}
              selectedIndex={selected.indexOf(item.id)}
              onToggleSelect={toggle}
            />
          </div>
        ))}
      </div>
    </>
  );
}
