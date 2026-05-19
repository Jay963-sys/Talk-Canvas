"use client";

import { useConfigurator, formatNaira } from "@/lib/store";
import { useCart } from "@/lib/cartStore";
import { ArrowLeft } from "lucide-react";

const STEP_NAMES = ["Upload", "Frame", "Size", "Review"];

export default function Summary() {
  const { step, setStep, image, frame, size, reset } = useConfigurator();
  const { addItem, setOpen: setCartOpen } = useCart();

  const totalPrice =
    frame && size ? Math.round(size.basePrice * frame.priceMultiplier) : 0;

  const canAdvance = () => {
    if (step === 0) return !!image;
    if (step === 1) return !!frame;
    if (step === 2) return !!size;
    return true;
  };

  const handleAddToCart = () => {
    if (!image || !frame || !size) return;
    addItem({
      imageUrl: image.url,
      imagePublicId: image.publicId,
      frameId: frame.id,
      frameName: frame.name,
      sizeId: size.id,
      sizeName: size.name,
      sizeDims: size.dims,
      price: totalPrice,
    });
    reset();
    setCartOpen(true);
  };

  return (
    <div className="bg-paper p-7 sticky top-[100px]">
      <p className="text-xs uppercase tracking-[0.15em] text-muted mb-5">
        Your Selection
      </p>

      <SummaryRow label="Design" value={image ? "Uploaded ✓" : "—"} />
      <SummaryRow label="Frame" value={frame?.name || "—"} />
      <SummaryRow
        label="Size"
        value={size ? `${size.name} (${size.dims})` : "—"}
      />

      <div className="mt-6 pt-5 border-t border-line">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted">Total</span>
          <span className="display text-3xl font-medium">
            {totalPrice > 0 ? formatNaira(totalPrice) : "—"}
          </span>
        </div>
        <p className="text-[11px] text-muted mt-1.5">
          Shipping calculated at checkout
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className={`py-4 text-sm font-medium tracking-wider text-cream transition-all ${
              canAdvance()
                ? "bg-accent hover:bg-accent-dark hover:-translate-y-0.5"
                : "bg-muted opacity-60 cursor-not-allowed"
            }`}
          >
            Continue → {STEP_NAMES[step + 1]}
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handleAddToCart}
            className="py-4 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-all"
          >
            Add to cart → {formatNaira(totalPrice)}
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="py-3.5 border border-line text-sm font-medium hover:border-ink hover:bg-ink hover:text-cream transition-all"
          >
            <ArrowLeft size={14} strokeWidth={2} className="inline mr-2" />
            Back
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
