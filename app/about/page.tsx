import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";

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

export const metadata = {
  title: "About Us — Talk Canvas Gallery",
};

export default function AboutPage() {
  return (
    <div className="fade-in bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-24 pb-32">
        {/* Brand Narrative - Centered and Confident */}
        <div className="text-center mb-24">
          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-6">
            About the Gallery
          </p>
          <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-10">
            Our Story
          </h1>
          <div className="text-[16px] leading-relaxed text-ink-soft max-w-2xl mx-auto space-y-6">
            <p>
              Talk Canvas Gallery opened in Lagos in 2021 with a simple
              intention: to make room for contemporary West African painting,
              and to let people live with it.
            </p>
            <p>
              Alongside our roster of represented artists, our print studio
              offers high-quality framed reproductions of your own designs —
              archival paper, hand-finished frames, and an AR tool that lets you
              see exactly how it'll sit on your wall before you buy.
            </p>
          </div>
        </div>

        {/* Gallery Info - Symmetric 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 border-t border-line pt-16">
          <InfoBlock label="Visit Us">
            <div className="flex flex-col items-center text-center gap-3">
              <MapPin size={20} strokeWidth={1.5} className="text-ink mb-2" />
              <p>
                5, Abeke Animashaun Street,
                <br />
                Lekki Phase 1, opp Ichie Kris
                <br />
                Onyekwuje Street,
                <br />
                Lagos, Nigeria 105102
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 mt-4 pt-4 border-t border-line/50 w-full">
              <Clock
                size={16}
                strokeWidth={1.5}
                className="text-ink-soft mb-1"
              />
              <p>
                Tues — Sat
                <br />
                11:00 AM — 6:00 PM
              </p>
            </div>
          </InfoBlock>

          <InfoBlock label="Contact">
            <div className="flex flex-col gap-6 w-full items-center">
              <a
                href="mailto:hello@talkcanvas.gallery"
                className="flex flex-col items-center gap-2 hover:text-ink text-ink-soft transition-colors"
              >
                <Mail size={20} strokeWidth={1.5} className="text-ink" />
                <span>hello@talkcanvas.gallery</span>
              </a>
              <a
                href="tel:+2349155328133"
                className="flex flex-col items-center gap-2 hover:text-ink text-ink-soft transition-colors"
              >
                <Phone size={20} strokeWidth={1.5} className="text-ink" />
                <span>+234 915 532 8133</span>
              </a>
              <a
                href="https://wa.me/2349155328133"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 hover:text-ink text-ink-soft transition-colors group"
              >
                <MessageCircle
                  size={20}
                  strokeWidth={1.5}
                  className="text-ink"
                />
                <span className="flex items-center gap-1.5">
                  WhatsApp
                  <ExternalLink
                    size={12}
                    className="opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                </span>
              </a>
            </div>
          </InfoBlock>

          <InfoBlock label="Social">
            <a
              href="https://instagram.com/talk_canvas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 hover:text-ink text-ink-soft transition-colors group"
            >
              <Instagram
                size={24}
                className="text-ink opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span>@talk_canvas</span>
            </a>
          </InfoBlock>
        </div>
      </div>
    </div>
  );
}

// Restyled to enforce center alignment for e-commerce uniformity
function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-8">
        {label}
      </p>
      <div className="text-[14px] leading-relaxed text-ink-soft w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
