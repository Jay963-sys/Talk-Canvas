"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
      strokeWidth="1.5"
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
    <footer className="bg-paper pt-16 md:pt-24 border-t border-line">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Newsletter Section - A staple of e-commerce minimalism */}
        <div className="flex flex-col items-center text-center pb-16 md:pb-24 border-b border-line">
          <h2 className="display text-2xl md:text-3xl mb-4">
            Join the gallery list
          </h2>
          <p className="text-[14px] text-ink-soft mb-8 max-w-md">
            Sign up to receive updates on new arrivals, exclusive releases, and
            gallery events.
          </p>
          <form
            className="flex w-full max-w-md border-b border-ink/30 pb-2 relative"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
              required
            />
            <button
              type="submit"
              className="text-ink hover:text-ink-soft transition-colors absolute right-0"
              aria-label="Subscribe"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </form>
        </div>

        {/* Main Footer Links - Evenly spaced 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Col 1: Brand & Bio */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="display text-2xl tracking-tight text-ink hover:opacity-80 transition-opacity w-fit"
            >
              Talk Canvas
            </Link>
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-xs">
              Creating beautiful art and interior décor solutions that transform
              spaces and inspire creativity.
            </p>
          </div>

          {/* Col 2: Shop */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] uppercase tracking-widest text-ink font-semibold">
              Shop
            </h3>
            <nav className="flex flex-col gap-3 text-[13px] text-ink-soft">
              <Link
                href="/originals"
                className="hover:text-ink transition-colors w-fit"
              >
                Originals
              </Link>
              <Link
                href="/prints"
                className="hover:text-ink transition-colors w-fit"
              >
                Prints
              </Link>
              <Link
                href="/prints/archive"
                className="hover:text-ink transition-colors w-fit"
              >
                Gallery Archive
              </Link>
              <Link
                href="/prints/custom"
                className="hover:text-ink transition-colors w-fit"
              >
                Custom Artwork
              </Link>
              <Link
                href="/artists"
                className="hover:text-ink transition-colors w-fit"
              >
                Artists
              </Link>
            </nav>
          </div>

          {/* Col 3: Support (Added to fill out the retail vibe) */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] uppercase tracking-widest text-ink font-semibold">
              Support
            </h3>
            <nav className="flex flex-col gap-3 text-[13px] text-ink-soft">
              <Link
                href="/about"
                className="hover:text-ink transition-colors w-fit"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="hover:text-ink transition-colors w-fit"
              >
                Contact
              </Link>
              <Link
                href="/shipping-returns"
                className="hover:text-ink transition-colors w-fit"
              >
                Shipping & Returns
              </Link>
              <Link
                href="/faq"
                className="hover:text-ink transition-colors w-fit"
              >
                FAQs
              </Link>
            </nav>
          </div>

          {/* Col 4: Contact & Address */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[11px] uppercase tracking-widest text-ink font-semibold">
              Contact
            </h3>
            <address className="not-italic flex flex-col gap-3 text-[13px] text-ink-soft">
              <p>
                <strong className="font-medium text-ink block mb-1">
                  Lagos Gallery
                </strong>
                5, Abeke Animashaun Street,
                <br />
                Lekki Phase 1,
                <br />
                Lagos, Nigeria 105102
              </p>
              <a
                href="mailto:info@talkcanvas.com"
                className="hover:text-ink transition-colors w-fit mt-2"
              >
                info@talkcanvas.com
              </a>
            </address>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 py-8 border-t border-line text-[11px] text-ink-soft">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <p>© {currentYear} Talk Canvas Gallery. All rights reserved.</p>
            <div className="hidden md:block w-px h-3 bg-line"></div>
            <Link href="#" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-ink transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center gap-5 text-ink">
            <a
              href="https://instagram.com/talk_canvas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-60 transition-opacity"
            >
              <Instagram size={18} />
            </a>
            {/* Keeping WhatsApp clean, dropping the text label to match Instagram */}
            <a
              href="https://wa.me/2349155328133"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:opacity-60 transition-opacity display-italic text-lg leading-none"
            >
              Wa
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
