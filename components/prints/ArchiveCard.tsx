"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { fetchArchiveSet } from "@/lib/archiveSet";
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

  const panels = item.setId ? (item.setSize ?? 0) : 0;
  const isSet = panels > 1;

  const select = async () => {
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

    // The grid carries only the leading panel, so the rest are fetched before
    // navigating — arriving at the configurator with a half-loaded set would
    // let the customer start choosing a frame for pieces we don't have yet.
    setLoading(true);
    try {
      const set = await fetchArchiveSet(item.setId!);
      reset();
      selectSet(set);
      setStep(1);
      router.push(CONFIGURATOR_ROUTE);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <button
        onClick={select}
        disabled={loading}
        aria-label={isSet ? `Frame this set of ${panels}` : "Frame this piece"}
        aria-busy={loading}
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

      {error && (
        <p className="text-[11px] text-red-600 mt-1.5">
          Couldn&apos;t load that set — please try again.
        </p>
      )}
    </div>
  );
}
