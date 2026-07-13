"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/admin/LogoutButton";

const links = [
  { href: "/admin", label: "Originals" },
  { href: "/admin/artists", label: "Artists" },
  { href: "/admin/archive-prints", label: "Archive" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/testimonials", label: "Reviews" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/originals");
  }
  return pathname.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* DESKTOP NAVIGATION 
        Visible on medium screens and up. Hidden on mobile.
      */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              isActive(link.href, pathname)
                ? "text-ink font-medium"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/" className="text-ink-soft hover:text-ink transition-colors">
          View site ↗
        </Link>
        <LogoutButton />
      </div>

      {/* MOBILE TOGGLE BUTTON 
        Visible on mobile. Hidden on medium screens and up.
      */}
      <div className="flex items-center justify-end md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-ink"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            // Close (X) Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Menu Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU 
        Renders absolutely positioned below the header when opened.
      */}
      {isMobileMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-md flex flex-col p-4 gap-4 md:hidden z-50 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Auto-close on click
              className={`transition-colors ${
                isActive(link.href, pathname)
                  ? "text-ink font-medium"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link 
            href="/" 
            className="text-ink-soft hover:text-ink transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            View site ↗
          </Link>
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
