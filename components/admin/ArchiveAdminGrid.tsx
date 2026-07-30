"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Layers, X } from "lucide-react";
import ArchiveAdminCard, { type AdminArchiveItem } from "./ArchiveAdminCard";
import ArchiveAdminSetCard from "./ArchiveAdminSetCard";

interface Props {
  items: AdminArchiveItem[];
  /**
   * Whether the "group pieces into a set" flow is offered. The sets-only view
   * passes false: every piece there is already grouped, so the action could
   * never complete.
   */
  allowGrouping?: boolean;
}

/** A grid cell: one loose print, or one whole set. */
type Entry =
  | { kind: "single"; key: string; item: AdminArchiveItem }
  | { kind: "set"; key: string; setId: number; panels: AdminArchiveItem[] };

export default function ArchiveAdminGrid({
  items,
  allowGrouping = true,
}: Props) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  // An ARRAY, not a Set: click order is hanging order, so the first piece
  // picked becomes the left-hand panel. A Set would silently reorder them.
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  /**
   * Collapse each set's panels into one entry, positioned where the set's
   * first panel appears in the incoming order — so sets stay roughly where
   * staff uploaded them rather than being herded into a separate section.
   * Panels are sorted by setPosition here, not left to the id ordering: a set
   * regrouped after a recategorisation can have ids out of hanging order.
   */
  const entries = useMemo<Entry[]>(() => {
    const bySet = new Map<number, AdminArchiveItem[]>();
    for (const item of items) {
      if (item.setId == null) continue;
      const list = bySet.get(item.setId) ?? [];
      list.push(item);
      bySet.set(item.setId, list);
    }
    for (const list of bySet.values()) {
      list.sort((a, b) => (a.setPosition ?? 0) - (b.setPosition ?? 0));
    }

    const out: Entry[] = [];
    const done = new Set<number>();
    for (const item of items) {
      if (item.setId == null) {
        out.push({ kind: "single", key: `p${item.id}`, item });
        continue;
      }
      if (done.has(item.setId)) continue;
      done.add(item.setId);
      const panels = bySet.get(item.setId) ?? [item];
      // A set that somehow lost its siblings is shown as a loose print rather
      // than as a "set of 1", which would be a state nothing can act on.
      if (panels.length < 2) {
        out.push({ kind: "single", key: `p${item.id}`, item });
        continue;
      }
      out.push({ kind: "set", key: `s${item.setId}`, setId: item.setId, panels });
    }
    return out;
  }, [items]);

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
      <div
        className={`flex flex-wrap items-center gap-3 ${
          allowGrouping ? "mb-6" : ""
        }`}
      >
        {!allowGrouping ? null : !selecting ? (
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

      {/* CSS grid rather than masonry columns: a set block has to span more
          than one column to fit its panels side by side, which `columns-*`
          can't express. Rows are slightly less tightly packed as a result —
          worth it to see a set as a set. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-start">
        {entries.map((entry) =>
          entry.kind === "single" ? (
            <ArchiveAdminCard
              key={entry.key}
              item={entry.item}
              selecting={selecting}
              selectedIndex={selected.indexOf(entry.item.id)}
              onToggleSelect={toggle}
            />
          ) : (
            <div
              key={entry.key}
              className={
                entry.panels.length >= 3
                  ? "col-span-2 sm:col-span-3"
                  : "col-span-2"
              }
            >
              <ArchiveAdminSetCard
                setId={entry.setId}
                panels={entry.panels}
                selecting={selecting}
              />
            </div>
          ),
        )}
      </div>
    </>
  );
}
