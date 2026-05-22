"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { formatNaira } from "@/lib/store";
import { usePathname } from "next/navigation";

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;
  if (pathname?.startsWith("/admin")) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        // 🚨 FIX 1: Changed h-full to h-[100dvh] for mobile browsers
        className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[440px] bg-cream z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <h2 className="display text-xl">Your cart</h2>
            <span className="text-sm text-muted">({items.length})</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close cart">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* 🚨 FIX 2 & 3: Added overscroll-contain and custom-scrollbar */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-6 py-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="display-italic text-2xl mb-3">
                Your cart is empty.
              </p>
              <p className="text-sm text-ink-soft">
                Explore original works or design a custom print.
              </p>
              <div className="flex flex-col gap-2 mt-6">
                <Link
                  href="/originals"
                  onClick={() => setOpen(false)}
                  className="inline-block px-6 py-3 bg-accent text-cream text-sm font-medium tracking-wider hover:bg-accent-dark transition-colors"
                >
                  Browse originals
                </Link>
                <Link
                  href="/prints"
                  onClick={() => setOpen(false)}
                  className="inline-block px-6 py-3 border border-ink text-ink text-sm font-medium tracking-wider hover:bg-ink hover:text-cream transition-colors"
                >
                  Make a print
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-line shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    {item.type === "original" ? (
                      <>
                        <p className="display-italic text-lg leading-tight">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {item.artist} · {item.year}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {item.frameName} · {item.sizeLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="display-italic text-lg leading-tight">
                          Custom print
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {item.frameName}
                          {item.glass ? " · with glass" : ""} · {item.sizeLabel}
                        </p>
                      </>
                    )}
                    <div className="mt-auto flex items-end justify-between">
                      <p className="text-sm font-medium">
                        {formatNaira(item.price)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-muted hover:text-ink flex items-center gap-1"
                      >
                        <Trash2 size={12} strokeWidth={1.5} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          // 🚨 Optional: added shrink-0 to ensure the footer never squishes
          <div className="px-6 py-5 border-t border-line shrink-0">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-muted">Subtotal</span>
              <span className="display text-2xl font-medium">
                {formatNaira(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="mt-4 block w-full py-4 bg-accent text-cream text-sm font-medium tracking-wider text-center hover:bg-accent-dark transition-colors"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
