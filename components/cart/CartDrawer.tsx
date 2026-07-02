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
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[440px] bg-cream z-50 flex flex-col transition-transform duration-300 shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} className="text-ink" />
            <h2 className="display text-2xl font-normal text-ink">Your Cart</h2>
            <span className="text-[13px] text-ink-soft">({items.length})</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="text-ink hover:text-ink-soft transition-colors p-1 -mr-1"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-6 py-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
              <p className="display text-3xl mb-4 text-ink">
                Your cart is empty.
              </p>
              <p className="text-[14px] text-ink-soft mb-8">
                Explore original works or design a custom print.
              </p>
              <div className="flex flex-col w-full max-w-[240px] gap-3">
                <Link
                  href="/originals"
                  onClick={() => setOpen(false)}
                  className="w-full py-3.5 bg-ink text-cream text-[11px] uppercase tracking-widest font-medium hover:bg-ink-soft transition-colors"
                >
                  Shop Originals
                </Link>
                <Link
                  href="/prints"
                  onClick={() => setOpen(false)}
                  className="w-full py-3.5 border border-line bg-transparent text-ink text-[11px] uppercase tracking-widest font-medium hover:border-ink transition-colors"
                >
                  Gallery Walls
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-5">
                  {/* Strict 4/5 Aspect Ratio for Cart Images */}
                  <div className="w-[75px] relative aspect-[4/5] bg-paper shrink-0 rounded-sm overflow-hidden border border-line/40">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col py-0.5">
                    {item.type === "original" ? (
                      <>
                        <p className="display text-[15px] leading-tight text-ink mb-1">
                          {item.title}
                        </p>
                        <p className="text-[12px] text-ink-soft">
                          {item.artist} · {item.year}
                        </p>
                        <p className="text-[12px] text-ink-soft mt-0.5">
                          {item.frameName} · {item.sizeLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="display text-[15px] leading-tight text-ink mb-1">
                          Custom Print
                        </p>
                        <p className="text-[12px] text-ink-soft">
                          {item.frameName}
                          {item.glass ? " · Glass" : ""}
                        </p>
                        <p className="text-[12px] text-ink-soft mt-0.5">
                          {item.sizeLabel}
                        </p>
                      </>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <p className="text-[13px] font-medium text-ink">
                        {formatNaira(item.price)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors"
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-line shrink-0 bg-cream">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold">
                Subtotal
              </span>
              <span className="display text-3xl font-medium text-ink leading-none">
                {formatNaira(subtotal)}
              </span>
            </div>
            <p className="text-[12px] text-ink-soft mb-6">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block w-full py-4 bg-ink text-cream text-[12px] uppercase tracking-widest font-medium text-center hover:bg-ink-soft transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
