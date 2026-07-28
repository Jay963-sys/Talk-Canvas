"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Search, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import clsx from "clsx";
import { useCart } from "@/lib/cartStore";

type NavItem = {
  href: string;
  label: string;
  dropdown?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/originals", label: "Originals" },
  {
    href: "/prints",
    label: "Prints",
    dropdown: [
      { href: "/prints", label: "Gallery Walls" },
      { href: "/prints/archive", label: "Archive" },
      { href: "/prints/sets", label: "Sets" },
      { href: "/prints/custom", label: "Custom" },
    ],
  },
  { href: "/artists", label: "Artists" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

// Home must match exactly — every path startsWith("/"), so the naive check
// would light up Home as active on every page.
function isActivePath(href: string, pathname: string | null): boolean {
  if (href === "/") return pathname === "/";
  return !!pathname?.startsWith(href);
}

// Animation variants for the mobile menu
const menuVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const linkVars: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { ease: "easeOut", duration: 0.4 } },
};

// Animation for the search bar slide-down
const searchVars: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q");
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query.toString())}`);
      setSearchOpen(false);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-50 transition-colors duration-300 w-full",
          open || searchOpen
            ? "bg-cream"
            : "bg-cream/95 backdrop-blur shadow-sm",
        )}
      >
        {/* Top Announcement Bar */}
        <div className="w-full bg-ink text-cream text-[10px] sm:text-[11px] uppercase tracking-[0.1em] text-center py-2.5 font-medium">
          <Link href="/about" className="hover:opacity-80 transition-opacity">
            Shipping across Nigeria →
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Main Logo & Icons Row */}
          <div className="flex items-center justify-between py-5 md:py-6">
            {/* Left Area: Hamburger + Search */}
            <div className="flex-1 flex items-center justify-start gap-3 md:gap-4">
              <button
                className="md:hidden p-2 -ml-2 text-ink hover:text-ink-soft transition-colors"
                onClick={() => {
                  setOpen(!open);
                  setSearchOpen(false); // Close search if opening menu
                }}
                aria-label="Menu"
              >
                {open ? (
                  <X size={20} strokeWidth={1.5} />
                ) : (
                  <Menu size={20} strokeWidth={1.5} />
                )}
              </button>

              <button
                className="p-2 -ml-2 md:ml-0 text-ink hover:text-ink-soft transition-colors"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setOpen(false); // Close menu if opening search
                }}
              >
                {searchOpen ? (
                  <X size={20} strokeWidth={1.5} />
                ) : (
                  <Search size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Center Area: Logo */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/"
                className="display text-2xl md:text-3xl tracking-tight text-ink relative z-50 hover:opacity-80 transition-opacity"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(false);
                }}
              >
                Talk Canvas
              </Link>
            </div>

            {/* Right Area: Account & Cart */}
            <div className="flex-1 flex items-center justify-end gap-3 md:gap-5 relative z-50">
              <Link
                href="/admin/login"
                className="hidden md:flex p-2 text-ink hover:text-ink-soft transition-colors"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>

              <button
                className="relative p-2 text-ink hover:text-ink-soft transition-colors flex items-center"
                aria-label="Open cart"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(false);
                  setCartOpen(true);
                }}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 bg-ink text-cream text-[9px] font-medium rounded-full w-[15px] h-[15px] flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Row */}
          <nav className="hidden md:flex items-center justify-center gap-10 text-[13px] text-ink font-normal pb-5 relative">
            {NAV.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={clsx(
                    "relative transition-colors hover:text-ink-soft flex items-center gap-1.5 py-2",
                    isActivePath(item.href, pathname) && !item.dropdown
                      ? "text-ink border-b border-ink/30 pb-0.5"
                      : "text-ink",
                  )}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown
                      size={14}
                      className="opacity-60 group-hover:rotate-180 transition-transform duration-200"
                    />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-cream border border-line rounded-xl shadow-sm py-2 min-w-[160px] flex flex-col">
                      {item.dropdown.map((drop) => (
                        <Link
                          key={drop.href}
                          href={drop.href}
                          className="px-6 py-2.5 hover:bg-paper transition-colors text-[11px] uppercase tracking-widest text-ink text-center"
                        >
                          {drop.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Slide-down Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              variants={searchVars}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden border-t border-line bg-cream"
            >
              <div className="max-w-2xl mx-auto px-6 md:px-10 py-6">
                <form
                  onSubmit={handleSearch}
                  className="relative flex items-center"
                >
                  <Search
                    size={18}
                    strokeWidth={2}
                    className="absolute left-4 text-ink-soft"
                  />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search artists, prints, or collections..."
                    autoFocus
                    className="w-full bg-paper border border-line rounded-full py-3 pl-12 pr-4 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:border-ink transition-colors"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Full-screen animated mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVars}
            initial="initial"
            animate="animate"
            exit="exit"
            className="md:hidden fixed inset-0 z-40 flex flex-col justify-center bg-cream px-8 mt-[100px]"
          >
            <div className="flex flex-col gap-8 -mt-20">
              {NAV.map((item) => {
                const isActive = isActivePath(item.href, pathname);

                return (
                  <motion.div
                    key={item.href}
                    variants={linkVars}
                    className="flex flex-col gap-4"
                  >
                    <Link
                      href={item.href}
                      onClick={() => !item.dropdown && setOpen(false)}
                      className={clsx(
                        "display text-4xl tracking-tight transition-colors flex items-center gap-4",
                        isActive ? "text-ink" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>

                    {/* Mobile Dropdown Items */}
                    {item.dropdown && (
                      <div className="flex flex-col gap-4 pl-4 border-l-2 border-line/50 ml-2 mt-1">
                        {item.dropdown.map((drop) => (
                          <Link
                            key={drop.href}
                            href={drop.href}
                            onClick={() => setOpen(false)}
                            className="text-xl tracking-tight text-ink-soft hover:text-ink transition-colors"
                          >
                            {drop.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Mobile Account Link */}
              <motion.div
                variants={linkVars}
                className="mt-4 pt-8 border-t border-line"
              >
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="text-ink-soft text-lg flex items-center gap-3"
                >
                  <User size={20} strokeWidth={1.5} />
                  Account
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
