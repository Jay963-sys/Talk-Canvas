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

export const metadata = {
  title: "About — Talk Canvas Gallery",
};

export default function AboutPage() {
  return (
    <div className="fade-in max-w-4xl mx-auto px-6 md:px-10 pt-16 pb-32">
      <p className="text-xs uppercase tracking-[0.15em] text-muted">About</p>

      <h1 className="display text-6xl md:text-8xl font-normal leading-none mt-4">
        Looking, slowly.
      </h1>

      <div className="mt-12 grid md:grid-cols-2 gap-12 text-[17px] leading-relaxed text-ink-soft">
        <p>
          Talk Canvas Gallery opened in Lagos in 2021 with a simple intention:
          to make room for contemporary West African painting, and to let people
          live with it.
        </p>

        <p>
          Alongside our roster of represented artists, our print studio offers
          high-quality framed reproductions of your own designs — archival
          paper, hand-finished frames, and an AR tool that lets you see exactly
          how it'll sit on your wall before you buy.
        </p>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 border-t border-line pt-10">
        <InfoBlock label="Visit">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-1 text-muted shrink-0" />

              <p>
                5, Abeke Animashaun Street, Lekki phase 1, opp Ichie Kris
                Onyekwuje Street,
                <br />
                Lekki, Lagos, Nigeria 105102
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={16} className="text-muted shrink-0" />

              <p>Tues — Sat, 11am — 6pm</p>
            </div>
          </div>
        </InfoBlock>

        <InfoBlock label="Contact">
          <div className="space-y-4">
            <a
              href="mailto:hello@talkcanvas.gallery"
              className="flex items-center gap-3 hover:text-accent transition-colors group"
            >
              <Mail
                size={16}
                className="text-muted group-hover:text-accent transition-colors"
              />

              <span>hello@talkcanvas.gallery</span>
            </a>

            <a
              href="tel:+2349155328133"
              className="flex items-center gap-3 hover:text-accent transition-colors group"
            >
              <Phone
                size={16}
                className="text-muted group-hover:text-accent transition-colors"
              />

              <span>+234 915 532 8133</span>
            </a>

            <a
              href="https://wa.me/2349155328133"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-accent transition-colors group"
            >
              <MessageCircle
                size={16}
                className="text-muted group-hover:text-accent transition-colors"
              />

              <span>WhatsApp</span>

              <ExternalLink
                size={14}
                className="opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </InfoBlock>

        <InfoBlock label="Follow">
          <a
            href="https://instagram.com/talk_canvas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 hover:text-accent transition-colors group"
          >
            <Instagram
              size={14}
              className="opacity-50 group-hover:opacity-100 transition-opacity"
            />
            <span>@talk_canvas</span>
          </a>
        </InfoBlock>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
        {label}
      </p>

      <div className="text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );
}
