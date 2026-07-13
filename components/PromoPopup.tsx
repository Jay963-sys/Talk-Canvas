"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Check, Tag } from "lucide-react";

const DISMISS_KEY = "tc_promo_seen";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 3000;
const CLOSE_DELAY_MS = 1500; // How long to force them to read

function hasSeen(code: string): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${DISMISS_KEY}=`) && c.endsWith(code));
}

function markSeen(code: string) {
  if (typeof window === "undefined") return;
  const maxAge = 60 * 60 * 24 * DISMISS_DAYS;
  document.cookie = `${DISMISS_KEY}=${code}; max-age=${maxAge}; path=/; samesite=lax`;
}

export default function PromoPopup({
  code,
  discountPercent,
}: {
  code: string;
  discountPercent: number;
}) {
  const [open, setOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    markSeen(code);
    setOpen(false);
  }, [code]);

  // Handle Initial Delay
  useEffect(() => {
    if (hasSeen(code)) return;

    const t = setTimeout(() => {
      if (!window.location.pathname.startsWith("/checkout")) {
        setOpen(true);
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(t);
  }, [code, pathname]);

  // Handle Scroll Lock & Delayed Close Button
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    // Wait 1.5s before enabling the exit routes
    const closeTimer = setTimeout(() => setShowClose(true), CLOSE_DELAY_MS);

    const onKey = (e: KeyboardEvent) => {
      // Only allow Escape if the delay has passed
      if (e.key === "Escape" && showClose) close();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(closeTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [open, close, showClose]); // Added showClose to dependencies

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  if (!open) return null;

  return (
    <div
      // Added a subtle fade-in animation to the backdrop
      className="fixed inset-x-0 top-0 z-[90] h-[100dvh] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome offer"
      onClick={(e) => {
        // Only allow backdrop click if the delay has passed
        if (e.target === e.currentTarget && showClose) close();
      }}
    >
      {/* Added a subtle slide-up and scale-in animation to the modal */}
      <div className="relative w-full max-w-md bg-cream border border-line p-8 md:p-10 text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Render button but keep it invisible/unclickable until showClose is true */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          disabled={!showClose}
          className={`absolute top-4 right-4 p-1 text-ink-soft hover:text-ink transition-all duration-300 ${
            showClose
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 bg-accent/10 text-accent text-[10px] uppercase tracking-widest font-semibold border border-accent/20">
          <Tag size={12} strokeWidth={2} /> Welcome Gift
        </div>

        <h2 className="display text-4xl md:text-5xl font-normal leading-tight mb-4">
          <span className="text-accent">{discountPercent}% off</span>
          <br />
          your first order
        </h2>

        <p className="text-[14px] text-ink-soft leading-relaxed mb-8 px-4">
          Available on prints and Talk Canvas Originals. Use this code at
          checkout.
        </p>

        <button
          type="button"
          onClick={copy}
          className="w-full border border-dashed border-ink bg-paper py-5 mb-4 hover:bg-ink hover:text-cream hover:border-solid transition-all duration-300 group"
        >
          <span className="display text-2xl tracking-[0.1em]">{code}</span>
          <span className="block text-[10px] uppercase tracking-widest opacity-60 mt-2">
            {copied ? (
              <span className="inline-flex items-center gap-1 text-green-500">
                <Check size={11} strokeWidth={2} /> Copied to clipboard
              </span>
            ) : (
              "Tap to copy code"
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={close}
          // The primary button is also disabled during the initial 1.5s read-time
          disabled={!showClose}
          className={`w-full py-4 text-cream text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${
            showClose
              ? "bg-ink hover:bg-ink-soft"
              : "bg-ink-soft/50 cursor-not-allowed"
          }`}
        >
          Start browsing
        </button>

        <p className="text-[11px] text-muted mt-5 leading-relaxed">
          One use per customer. Excludes one-of-one artist works.
        </p>
      </div>
    </div>
  );
}
