"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/admin/LogoutButton";

const links = [
  { href: "/admin", label: "Originals" },
  { href: "/admin/artists", label: "Artists" },
  { href: "/admin/archive-prints", label: "Archive" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/affiliates", label: "Affiliates" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/originals");
  }
  return pathname.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-6 text-sm">
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
  );
}
