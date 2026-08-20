"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useConfigurator, type ConfiguratorSet } from "@/lib/store";
import { fetchArchiveSet } from "@/lib/archiveSet";
import SetLightbox, { type LightboxPanel } from "./SetLightbox";
import type { ArchiveItem } from "./ArchiveGrid";

const CONFIGURATOR_ROUTE = "/prints";

function thumb(url: string, width = 600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function ArchiveCard({ item }: { item: ArchiveItem }) {
  const router = useRouter();
  const { reset, setImage, selectSet, setStep } = useConfigurator();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Opened at a specific panel — tapping the third thumbnail should land on the
  // third piece, not send the customer stepping back to it.
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [framing, setFraming] = useState(false);
  const [lightboxError, setLightboxError] = useState<string | null>(null);
  // Cached so the fetch that backs a fallback open isn't repeated when the
  // customer then chooses to frame the set.
  const [cachedSet, setCachedSet] = useState<ConfiguratorSet | null>(null);

  const panels = item.setId ? (item.setSize ?? 0) : 0;
  const isSet = panels > 1;

  const feedPanels: LightboxPanel[] | null =
    item.panels && item.panels.length > 0
      ? item.panels.map((p) => ({
          imageUrl: p.imageUrl,
          width: p.width,
          height: p.height,
        }))
      : null;

  const lightboxPanels: LightboxPanel[] =
    feedPanels ??
    (cachedSet
      ? cachedSet.pieces.map((p) => ({
          imageUrl: p.url,
          width: p.width,
          height: p.height,
        }))
      : []);

  const loadSet = async (): Promise<ConfiguratorSet> => {
    if (cachedSet) return cachedSet;
    const set = await fetchArchiveSet(item.setId!);
    setCachedSet(set);
    return set;
  };

  /** Single pieces go straight to the configurator; sets open for a look first. */
  const select = async (index = 0) => {
    if (loading) return;
    setError(false);

    if (!isSet) {
      reset();
      setImage({
        url: item.imageUrl,
        publicId: item.imagePublicId,
        width: item.width,
        height: item.height,
      });
      setStep(1);
      router.push(CONFIGURATOR_ROUTE);
      return;
    }

    // With panels in the feed this opens with no network at all. Without them
    // — a grid whose query wasn't wrapped in withSetPanels — fall back to the
    // set endpoint so the large view still works.
    if (feedPanels) {
      setLightboxError(null);
      setOpenAt(index);
      return;
    }

    setLoading(true);
    try {
      await loadSet();
      setLightboxError(null);
      setOpenAt(index);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /** From the large view into the configurator, with the whole set selected. */
  const frameSet = async () => {
    if (framing) return;
    setFraming(true);
    setLightboxError(null);
    try {
      // Fetched even when the feed gave us panels: the configurator needs the
      // publicIds and the endpoint's availability check, and a set pulled since
      // the page loaded should fail here rather than at checkout.
      const set = await loadSet();
      reset();
      selectSet(set);
      setStep(1);
      router.push(CONFIGURATOR_ROUTE);
    } catch {
      setLightboxError("That set is no longer available.");
    } finally {
      setFraming(false);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <button
        onClick={() => select(0)}
        disabled={loading}
        aria-label={
          isSet ? `View this set of ${panels}` : "Frame this piece"
        }
        aria-busy={loading}
        aria-haspopup={isSet ? "dialog" : undefined}
        className="group relative block w-full overflow-hidden bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <img
          src={thumb(item.imageUrl)}
          alt=""
          loading="lazy"
          width={item.width}
          height={item.height}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* The tile shows one panel. Without this badge a customer clicks
            through expecting one piece and meets a price for several. */}
        {isSet && (
          <span className="absolute top-2 left-2 bg-ink text-cream text-[10px] uppercase tracking-widest px-2 py-1">
            Set of {panels}
          </span>
        )}

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-cream/70">
            <Loader2
              className="animate-spin text-ink"
              size={22}
              strokeWidth={1.5}
            />
          </span>
        )}
      </button>

      {/* The rest of the group, in hanging order. The badge says how many; this
          says what they are — which is what a customer needs before deciding
          whether the set suits their wall. Kept small so the lead piece stays
          the tile, and so a set of four doesn't tower over its neighbours in
          the masonry column. */}
      {isSet && feedPanels && feedPanels.length > 1 && (
        <div className="flex gap-1.5 mt-1.5">
          {feedPanels.map((p, i) => (
            <button
              key={p.imageUrl}
              type="button"
              onClick={() => select(i)}
              aria-label={`View piece ${i + 1} of ${panels}`}
              aria-haspopup="dialog"
              className="relative flex-1 min-w-0 overflow-hidden bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
            >
              <img
                src={thumb(p.imageUrl, 200)}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 mt-1.5">
          Couldn&apos;t load that set — please try again.
        </p>
      )}

      {openAt !== null && lightboxPanels.length > 0 && (
        <SetLightbox
          panels={lightboxPanels}
          startIndex={openAt}
          onClose={() => setOpenAt(null)}
          onFrame={frameSet}
          framing={framing}
          error={lightboxError}
        />
      )}
    </div>
  );
}
