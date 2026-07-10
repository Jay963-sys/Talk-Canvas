"use client";

import { useRouter } from "next/navigation";
import { useConfigurator } from "@/lib/store";
import type { ArchiveItem } from "./ArchiveGrid";

const CONFIGURATOR_ROUTE = "/prints";

function thumb(url: string, width = 600): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

export default function ArchiveCard({ item }: { item: ArchiveItem }) {
  const router = useRouter();
  const { reset, setImage, setStep } = useConfigurator();

  const select = () => {
    reset();
    setImage({
      url: item.imageUrl,
      publicId: item.imagePublicId,
      width: item.width,
      height: item.height,
    });
    setStep(1);
    router.push(CONFIGURATOR_ROUTE);
  };

  return (
    <button
      onClick={select}
      aria-label="Frame this piece"
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
