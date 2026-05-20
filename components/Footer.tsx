"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-line mt-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row gap-8 md:items-end md:justify-between">
        <div>
          <p className="display text-xl font-medium">
            Talk Canvas{" "}
            <span className="display-italic text-accent">Gallery</span>
          </p>
          <p className="text-xs text-muted mt-2">
            © 2026 Talk Canvas Gallery, Lagos.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-ink-soft">
          <Link href="/originals">Originals</Link>
          <Link href="/prints">Prints</Link>
          <Link href="/about">About</Link>
          <Link
            href="/contact"
            className="text-ink-soft hover:text-ink transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
