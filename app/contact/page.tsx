import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { SHIPPING_CONFIG } from "@/data/shipping";
import { CONTACT } from "@/data/contact";
import ContactForm from "@/components/contact/ContactForm";

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
  title: "Contact — Talk Canvas Gallery",
  description:
    "Visit our showroom, send us a message, or reach out on WhatsApp. We'd love to hear from you.",
};

export default function ContactPage() {
  const addressEncoded = encodeURIComponent(SHIPPING_CONFIG.pickup.address);
  // ✅ Fixed template literals and updated to standard Google Maps URLs
  const mapsLink = `https://maps.google.com/maps?q=${addressEncoded}`;
  const mapsEmbed = `https://maps.google.com/maps?q=${addressEncoded}&output=embed`;

  return (
    <div>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-16 pb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          Contact
        </p>
        <h1 className="display text-5xl md:text-6xl lg:text-7xl font-normal mt-3 leading-[1.05]">
          Get in <span className="display-italic">touch</span>
        </h1>
        <p className="text-ink-soft mt-6 leading-relaxed max-w-xl">
          Visit our showroom, send us a message, or reach out on WhatsApp. We'd
          love to hear from you.
        </p>
      </div>

      {/* Info + Form grid */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Info column */}
          <div className="space-y-10">
            {/* Visit */}
            <section>
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                Visit
              </h2>
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  strokeWidth={1.5}
                  className="text-ink-soft mt-1 shrink-0"
                />
                <div>
                  <p className="text-sm text-ink whitespace-pre-line leading-relaxed">
                    {SHIPPING_CONFIG.pickup.address}
                  </p>

                  {/* ✅ Restored <a tag */}
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dark mt-2"
                  >
                    Open in Maps
                    <ExternalLink size={11} strokeWidth={1.5} />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <Clock
                  size={18}
                  strokeWidth={1.5}
                  className="text-ink-soft mt-1 shrink-0"
                />
                <div>
                  <p className="text-sm text-ink">
                    {SHIPPING_CONFIG.pickup.days}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {SHIPPING_CONFIG.pickup.hours}
                  </p>
                </div>
              </div>
            </section>

            {/* Reach us */}
            <section>
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                Reach us
              </h2>
              <div className="space-y-3">
                {/* ✅ Restored <a tag */}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 text-sm text-ink hover:text-accent transition-colors group"
                >
                  <Mail
                    size={18}
                    strokeWidth={1.5}
                    className="text-ink-soft group-hover:text-accent transition-colors"
                  />
                  {CONTACT.email}
                </a>

                {/* ✅ Restored <a tag */}
                <a
                  href={`https://wa.me/${CONTACT.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-ink hover:text-accent transition-colors group"
                >
                  <MessageCircle
                    size={18}
                    strokeWidth={1.5}
                    className="text-ink-soft group-hover:text-accent transition-colors"
                  />
                  <span>
                    {CONTACT.whatsapp.display}
                    <span className="ml-2 text-xs text-muted">WhatsApp</span>
                  </span>
                </a>

                {/* ✅ Restored <a tag */}
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-ink hover:text-accent transition-colors group"
                >
                  <Phone
                    size={18}
                    strokeWidth={1.5}
                    className="text-ink-soft group-hover:text-accent transition-colors"
                  />
                  {CONTACT.phone}
                </a>
              </div>
            </section>

            {/* Follow */}
            <section>
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                Follow
              </h2>

              {/* ✅ Restored <a tag */}
              <a
                href={CONTACT.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-ink hover:text-accent transition-colors group"
              >
                <Instagram
                  size={18}
                  strokeWidth={1.5}
                  className="text-ink-soft group-hover:text-accent transition-colors"
                />
                {CONTACT.instagram.handle}
              </a>
            </section>
          </div>

          {/* Form column */}
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Map */}
      <section className="border-t border-line">
        <iframe
          src={mapsEmbed}
          width="100%"
          height="450"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Talk Canvas Gallery showroom location"
        />
      </section>
    </div>
  );
}
