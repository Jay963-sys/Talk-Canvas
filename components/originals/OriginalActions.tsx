"use client";

import { useState } from "react";
import { ShoppingBag, Box, Check } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { originalFrameLabel, originalSizeLabel } from "@/lib/originalDisplay";
import OriginalARModal from "./OriginalARModal";
import type { Original } from "@/lib/db/schema";

export default function OriginalActions({ original }: { original: Original }) {
  const { addOriginal, items, setOpen } = useCart();
  const [arOpen, setArOpen] = useState(false);

  const isSold = !!original.soldAt;
  const inCart = items.some(
    (i) => i.type === "original" && i.originalId === original.id,
  );

  const handleAddToCart = () => {
    if (inCart) {
      setOpen(true);
      return;
    }
    addOriginal({
      originalId: original.id,
      slug: original.slug,
      title: original.title,
      artist: original.artist,
      year: original.year,
      imageUrl: original.imageUrl,
      imagePublicId: original.imagePublicId ?? "",
      frameName: originalFrameLabel(original),
      glass: original.glass,
      sizeLabel: originalSizeLabel(original),
      price: original.price,
    });
  };

  if (isSold) {
    return (
      <div className="space-y-4">
        <div className="inline-block px-4 py-2 border border-line text-muted uppercase text-xs tracking-[0.15em]">
          Sold
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          This original has found a home. Browse other available works, or get
          in touch about commissioning something similar.
        </p>
        <button
          onClick={() => setArOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink border-b border-line pb-0.5"
        >
          <Box size={16} strokeWidth={1.5} />
          Still preview it on your wall
        </button>
        {arOpen && (
          <OriginalARModal
            original={original}
            onClose={() => setArOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-ink text-cream uppercase text-xs tracking-[0.15em] hover:bg-ink-soft transition-colors"
      >
        {inCart ? (
          <>
            <Check size={16} strokeWidth={1.5} />
            In cart — view
          </>
        ) : (
          <>
            <ShoppingBag size={16} strokeWidth={1.5} />
            Add to cart
          </>
        )}
      </button>
      <button
        onClick={() => setArOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 border border-ink text-ink uppercase text-xs tracking-[0.15em] hover:bg-ink hover:text-cream transition-colors"
      >
        <Box size={16} strokeWidth={1.5} />
        Preview on your wall
      </button>
      {arOpen && (
        <OriginalARModal original={original} onClose={() => setArOpen(false)} />
      )}
    </div>
  );
}
