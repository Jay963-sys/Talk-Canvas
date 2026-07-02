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
  title: "Contact — Talk Canvas Gallery",
  description:
    "Visit our showroom, send us a message, or reach out on WhatsApp. We'd love to hear from you.",
};

export default function ContactPage() {
  const addressEncoded = encodeURIComponent(SHIPPING_CONFIG.pickup.address);
  const mapsLink = `https://maps.google.com/maps?q=${addressEncoded}`;
  const mapsEmbed = `https://maps.google.com/maps?q=${addressEncoded}&output=embed`;

  return (
    <div className="fade-in bg-cream min-h-screen">
      {/* Header Section - Centered and Minimalist */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-24 pb-16 text-center">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-6">
          Contact
        </p>
        <h1 className="display text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-6">
          Get in Touch
        </h1>
        <p className="text-[15px] text-ink-soft max-w-xl mx-auto leading-relaxed">
          Visit our showroom, send us a message, or reach out on WhatsApp. We'd
          love to hear from you.
        </p>
      </div>

      {/* Info + Form Grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Info Column */}
          <div className="flex flex-col gap-12">
            {/* Visit Section */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Visit
              </h2>
              <div className="flex flex-col gap-5 text-[15px] text-ink-soft">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink shrink-0"
                  />
                  <div>
                    <p className="whitespace-pre-line leading-relaxed text-ink">
                      {SHIPPING_CONFIG.pickup.address}
                    </p>
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest text-ink-soft hover:text-ink mt-3 transition-colors font-medium"
                    >
                      Open in Maps
                      <ExternalLink size={14} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-line/50 pt-5 mt-1">
                  <Clock
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink shrink-0"
                  />
                  <div>
                    <p className="text-ink">{SHIPPING_CONFIG.pickup.days}</p>
                    <p>{SHIPPING_CONFIG.pickup.hours}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reach Us Section */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Reach Us
              </h2>
              <div className="flex flex-col gap-5 text-[15px]">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 text-ink-soft hover:text-ink transition-colors group"
                >
                  <Mail
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink group-hover:text-ink-soft transition-colors"
                  />
                  {CONTACT.email}
                </a>

                <a
                  href={`https://wa.me/${CONTACT.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-soft hover:text-ink transition-colors group"
                >
                  <MessageCircle
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink group-hover:text-ink-soft transition-colors"
                  />
                  <span>
                    {CONTACT.whatsapp.display}
                    <span className="ml-2 text-[12px] uppercase tracking-widest text-ink-soft/70">
                      WhatsApp
                    </span>
                  </span>
                </a>

                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-ink-soft hover:text-ink transition-colors group"
                >
                  <Phone
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink group-hover:text-ink-soft transition-colors"
                  />
                  {CONTACT.phone}
                </a>
              </div>
            </section>

            {/* Follow Section */}
            <section>
              <h2 className="text-[11px] uppercase tracking-widest text-ink font-semibold mb-6">
                Follow
              </h2>
              <a
                href={CONTACT.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[15px] text-ink-soft hover:text-ink transition-colors group w-fit"
              >
                <Instagram
                  size={20}
                  strokeWidth={1.5}
                  className="text-ink group-hover:text-ink-soft transition-colors"
                />
                {CONTACT.instagram.handle}
              </a>
            </section>
          </div>

          {/* Form Column - Wrapped in a card */}
          <div className="bg-paper p-8 md:p-10 rounded-2xl shadow-sm border border-line/40">
            <h2 className="display text-2xl mb-8">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Map - Grayscale filter added for a premium aesthetic */}
      <section className="border-t border-line grayscale hover:grayscale-0 transition-all duration-700">
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
