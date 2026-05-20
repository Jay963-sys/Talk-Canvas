"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import clsx from "clsx";
import { useCart } from "@/lib/cartStore";

const NAV = [
  { href: "/originals", label: "Originals" },
  { href: "/prints", label: "Prints" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Animation variants for the stagger effect
const menuVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const linkVars: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      ease: "easeOut",
      duration: 0.4,
    },
  },
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { items, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);
  const cartCount = mounted ? items.length : 0;

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Header needs a higher z-index (50) than the menu overlay (40) so the close button is clickable */}
      <header
        className={clsx(
          "sticky top-0 z-50 transition-colors duration-300",
          open
            ? "bg-cream" // Solid background when menu is open
            : "bg-cream/90 backdrop-blur border-b border-line",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="display text-[22px] font-semibold tracking-tight relative z-50"
            onClick={() => setOpen(false)}
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
                  pathname?.startsWith(item.href)
                    ? "text-ink"
                    : "text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 relative z-50">
            <button
              className="relative p-2 text-ink"
              aria-label="Open cart"
              onClick={() => {
                setOpen(false); // Close menu if opening cart
                setCartOpen(true);
              }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-cream text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 text-ink"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen animated mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVars}
            initial="initial"
            animate="animate"
            exit="exit"
            className="md:hidden fixed inset-0 z-40 flex flex-col justify-center bg-cream px-8"
          >
            <div className="flex flex-col gap-8">
              {NAV.map((item) => {
                const isActive = pathname?.startsWith(item.href);

                return (
                  <motion.div key={item.href} variants={linkVars}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "display text-5xl tracking-tight transition-colors flex items-center gap-4",
                        isActive ? "text-ink" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      {item.label}

                      {/* Accent dot indicator for the active page */}
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-accent mt-1" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
