"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/lib/cartStore";

const NAV = [
  { href: "/originals", label: "Originals" },
  { href: "/prints", label: "Prints" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { items, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? items.length : 0;

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="display text-[22px] font-semibold tracking-tight"
        >
          Talk Canvas{" "}
          <span className="display-italic text-accent">Gallery</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative transition-colors hover:text-ink",
                pathname.startsWith(item.href) ? "text-ink" : "text-ink-soft",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="relative p-2"
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-cream text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-3 border-t border-line">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2 text-[15px]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
