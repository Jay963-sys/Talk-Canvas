"use client";

import {
  buildWhatsAppHelpMessage,
  getWhatsAppHelpUrl,
  WhatsAppHelpItem,
} from "@/lib/whatsappHelp";

interface WhatsAppHelpButtonProps {
  items: WhatsAppHelpItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryZoneLabel?: string;
  quoteOnRequest?: boolean;
  orderRef?: string;
}

// Checkout-only "need help completing your order?" WhatsApp button.
// Deliberately not a global/site-wide floating icon — see area notes on
// why this stays scoped to checkout (support channel, not a sales workaround).
export default function WhatsAppHelpButton({
  items,
  subtotal,
  shipping,
  total,
  deliveryZoneLabel,
  quoteOnRequest,
  orderRef,
}: WhatsAppHelpButtonProps) {
  const message = buildWhatsAppHelpMessage({
    items,
    subtotal,
    shipping,
    total,
    deliveryZoneLabel,
    quoteOnRequest,
    orderRef,
  });
  const href = getWhatsAppHelpUrl(message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3"
      aria-label="Need help completing your order? Chat with us on WhatsApp"
    >
      <span
        className="
          pointer-events-none hidden sm:block whitespace-nowrap
          bg-ink text-cream text-[11px] uppercase tracking-widest font-medium
          px-4 py-2.5 rounded-full shadow-lg
          opacity-0 translate-x-2 transition-all duration-200
          group-hover:opacity-100 group-hover:translate-x-0
        "
      >
        Need help with your order?
      </span>

      <span
        className="
          flex items-center justify-center w-14 h-14 rounded-full
          bg-ink text-cream shadow-lg
          transition-transform duration-200 group-hover:scale-105
        "
      >
        <WhatsAppIcon className="w-6 h-6" />
      </span>
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.663 4.523 1.813 6.379L4 29l7.805-1.775A11.95 11.95 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.945-1.354l-.355-.21-4.633 1.053 1.08-4.514-.232-.371A9.69 9.69 0 0 1 5.25 15c0-5.93 4.824-10.75 10.754-10.75S26.75 9.07 26.75 15 21.934 24.75 16.004 24.75Zm5.53-7.34c-.302-.152-1.789-.883-2.066-.984-.277-.102-.479-.152-.68.152-.2.303-.78.984-.957 1.187-.176.202-.352.227-.654.076-.302-.152-1.276-.47-2.43-1.5-.898-.802-1.505-1.792-1.682-2.095-.176-.303-.019-.467.133-.618.137-.136.302-.353.453-.53.15-.176.2-.303.302-.505.101-.202.05-.379-.026-.53-.076-.152-.68-1.64-.933-2.246-.246-.591-.496-.51-.68-.52-.176-.008-.378-.01-.58-.01a1.11 1.11 0 0 0-.807.379c-.277.303-1.06 1.036-1.06 2.527s1.085 2.932 1.236 3.135c.151.202 2.135 3.26 5.172 4.572.723.312 1.287.499 1.727.638.726.231 1.386.198 1.908.12.582-.087 1.789-.732 2.041-1.438.252-.706.252-1.311.176-1.438-.075-.126-.277-.202-.579-.353Z" />
    </svg>
  );
}
