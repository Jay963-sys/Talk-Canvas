"use client";

import { useConfigurator, formatNaira } from "@/lib/store";
import { useCart } from "@/lib/cartStore";
import { getPrice } from "@/data/pricing";
import { formatInches, orientationOf } from "@/data/sizes";
import { withCrop, FULL_CROP } from "@/lib/crop";
import { ArrowLeft } from "lucide-react";

const STEP_NAMES = ["Upload", "Frame", "Size", "Review"];

export default function Summary() {
  const { step, setStep, image, set, frame, glass, size, crop, reset } =
    useConfigurator();
  const { addItem, setOpen: setCartOpen } = useCart();

  const panels = set ? set.pieces.length : 1;
  const unitPrice = frame && size ? (getPrice(frame, glass, size) ?? 0) : 0;
  // The gallery's rule: a set costs N frames at the chosen size. No bundle
  // rate, no discount — just the same price, N times.
  const totalPrice = unitPrice * panels;

  // Sizes are stored portrait; a landscape design uses them rotated. The label
  // must record the orientation actually bought — it's what the gallery frames.
  const orientation = orientationOf(image);
  const sizeLabel = size ? formatInches(size, orientation) : null;

  const canAdvance = () => {
    if (step === 0) return !!image;
    if (step === 1) return !!frame;
    if (step === 2) return !!size && totalPrice > 0;
    return true;
  };

  const handleAddToCart = () => {
    if (!image || !frame || !size) return;
    const natural = { w: image.width, h: image.height };
    // Sets are never cropped — panels are pre-aligned by the gallery, so they
    // go in whole and the cropper is skipped on the Review step.
    const activeCrop = set ? FULL_CROP : (crop ?? FULL_CROP);

    addItem({
      // Bake the approved crop into the URL. Every downstream consumer — cart
      // thumbnail, order record, confirmation email, the file the gallery
      // prints — then shows exactly what the customer signed off on, with no
      // extra upload and no schema change. imagePublicId stays the base asset.
      imageUrl: withCrop(image.url, activeCrop, natural),
      imagePublicId: image.publicId,
      crop: activeCrop,
      frameId: frame.id,
      frameName: frame.name,
      glass,
      sizeId: size.id,
      sizeLabel: formatInches(size, orientation),
      orientation,
      // One line for the whole set: the pieces travel together so the order can
      // expand them into individual printable rows, and the customer can't
      // delete a single panel out of a triptych.
      set: set
        ? {
            setId: set.setId,
            pieces: set.pieces.map((p) => ({
              imageUrl: p.url,
              imagePublicId: p.publicId,
            })),
          }
        : null,
      price: totalPrice,
    });
    reset();
    setCartOpen(true);
  };

  return (
    <div className="bg-paper p-8 lg:p-10 rounded-2xl border border-line/40">
      <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
        Your Selection
      </p>

      <div className="space-y-1 mb-2">
        <SummaryRow
          label="Design"
          value={set ? `Set of ${panels} ✓` : image ? "Uploaded ✓" : "—"}
        />
        <SummaryRow
          label="Frame"
          value={frame ? frame.name + (glass ? " · with glass" : "") : "—"}
        />
        <SummaryRow
          label="Size"
          value={sizeLabel ? sizeLabel + (set ? " each" : "") : "—"}
        />
        {/* Shown only for sets, and only once a price exists — it's the line
            that explains why the total is three times the size's price. */}
        {set && unitPrice > 0 && (
          <SummaryRow
            label="Pieces"
            value={`${panels} × ${formatNaira(unitPrice)}`}
          />
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-line/60">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold">
            Total
          </span>
          <span className="display text-3xl font-medium text-ink leading-none">
            {totalPrice > 0 ? formatNaira(totalPrice) : "—"}
          </span>
        </div>
        <p className="text-[12px] text-ink-soft">
          {set
            ? "Delivery for sets is quoted after you order."
            : "Shipping calculated at checkout."}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className={`w-full py-4 text-[12px] uppercase tracking-widest font-medium transition-colors ${
              canAdvance()
                ? "bg-ink text-cream hover:bg-ink-soft"
                : "bg-line/50 text-ink-soft cursor-not-allowed"
            }`}
          >
            Continue to {STEP_NAMES[step + 1]}
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
          >
            Add {set ? "set" : ""} to cart — {formatNaira(totalPrice)}
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-4 border border-line text-[12px] uppercase tracking-widest font-medium hover:border-ink transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 text-[14px]">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
