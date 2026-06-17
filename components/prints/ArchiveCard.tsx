"use client";

import { useRouter } from "next/navigation";
import { useConfigurator } from "@/lib/store";
import type { ArchiveItem } from "./ArchiveGrid";

// The Configurator is mounted on /prints. Change this if yours lives elsewhere.
const CONFIGURATOR_ROUTE = "/prints";

// Mirrors getDownsizedUrl() in ARModal — width-bounded, ratio-preserving,
// auto format + quality. Cheap grid thumbnails straight off the source URL.
function thumb(url: string, width = 600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function ArchiveCard({ item }: { item: ArchiveItem }) {
  const router = useRouter();
  const { reset, setImage, setStep } = useConfigurator();

  const select = () => {
    // Clear any stale frame/size/image from a prior session, then drop the
    // chosen archive image into the same slot StepUpload would fill.
    reset();
    setImage({
      url: item.imageUrl,
      publicId: item.imagePublicId,
      width: item.width,
      height: item.height,
    });
    setStep(1); // skip Upload (step 0) — land on Frame
    router.push(CONFIGURATOR_ROUTE); // client nav preserves the in-memory store
  };

  return (
    <button
      onClick={select}
      aria-label="Frame this piece"
      className="group mb-4 block w-full break-inside-avoid overflow-hidden bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
    </button>
  );
}
