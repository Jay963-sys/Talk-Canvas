"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Mail, Phone } from "lucide-react";

function Instagram({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line mt-10 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand & Address */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <p className="display text-2xl font-medium tracking-tight">
                Talk Canvas{" "}
                <span className="display-italic text-accent">Gallery</span>
              </p>
              <p className="text-sm text-muted mt-2 max-w-sm leading-relaxed">
                Connecting audiences with premium prints and original
                hand-painted works.
              </p>
            </div>

            <address className="not-italic text-sm text-muted leading-relaxed">
              <strong className="text-ink font-medium">Lagos Gallery</strong>
              <br />
              5, Abeke Animashaun Street,
              <br />
              Lekki Phase 1, Opp. Ichie Kris Onyekwuje Street,
              <br />
              Lagos, Nigeria 105102
            </address>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">Explore</h3>
            <nav className="flex flex-col gap-3 text-sm text-ink-soft">
              <Link
                href="/originals"
                className="hover:text-accent transition-colors w-fit"
              >
                Originals
              </Link>
              <Link
                href="/prints"
                className="hover:text-accent transition-colors w-fit"
              >
                Prints
              </Link>
              <Link
                href="/about"
                className="hover:text-accent transition-colors w-fit"
              >
                About the Gallery
              </Link>
            </nav>
          </div>

          {/* Contact Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">Get in Touch</h3>
            <nav className="flex flex-col gap-3 text-sm text-ink-soft">
              <a
                href="mailto:hello@talkcanvas.gallery"
                className="hover:text-accent transition-colors flex items-center gap-2 w-fit"
              >
                <Mail size={16} />
                hello@talkcanvas.gallery
              </a>
              <a
                href="tel:+2349155328133"
                className="hover:text-accent transition-colors flex items-center gap-2 w-fit"
              >
                <Phone size={16} />
                +234 91 5532 8133
              </a>
              <a
                href="https://instagram.com/talk_canvas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-accent transition-colors flex items-center gap-2 w-fit"
              >
                <Instagram size={18} />
                @talk_canvas
              </a>

              <a
                href="https://wa.me/2349155328133"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hover:text-accent transition-colors flex items-center gap-2 w-fit"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div
          className=" 
  flex flex-col-reverse md:flex-row
  justify-between items-center
  gap-6
  border-t border-line
  mt-14 pt-10 md:pt-8
  text-xs text-muted
"
        >
          {" "}
          <p>© {currentYear} Talk Canvas Gallery. All rights reserved.</p>
          <div className="flex items-center gap-5"></div>
        </div>
      </div>
    </footer>
  );
}
