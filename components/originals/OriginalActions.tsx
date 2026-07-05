"use client";

import { useState } from "react";
import { ShoppingBag, Camera, Check } from "lucide-react";
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
      <div className="space-y-4 w-full">
        {/* Styled as a disabled e-commerce button for consistent UI height */}
        <button
          disabled
          className="w-full flex items-center justify-center py-4 bg-paper text-ink-soft text-[12px] uppercase tracking-widest font-medium cursor-not-allowed"
        >
          Sold Out
        </button>
        <p className="text-[13px] text-ink-soft leading-relaxed text-center">
          This original has found a home. Get in touch to commission a similar
          piece.
        </p>
        <button
          onClick={() => setArOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border border-line text-ink text-[12px] uppercase tracking-widest font-medium hover:border-ink transition-colors"
        >
          <Camera size={16} strokeWidth={1.5} />
          See it on your wall
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
    <div className="space-y-3 w-full">
      {/* Primary Action */}
      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 py-4 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
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

      {/* Secondary Action — the AR entry. Camera icon + outcome-led label so it
          reads as "use your real room", not another 3D toy. */}
      <div>
        <button
          onClick={() => setArOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border border-line text-ink text-[12px] uppercase tracking-widest font-medium hover:border-ink transition-colors"
        >
          <Camera size={16} strokeWidth={1.5} />
          See it on your wall
        </button>
        <p className="text-[12px] text-ink-soft text-center mt-2">
          Use your phone camera to place it in your room at true size.
        </p>
      </div>

      {arOpen && (
        <OriginalARModal original={original} onClose={() => setArOpen(false)} />
      )}
    </div>
  );
}
