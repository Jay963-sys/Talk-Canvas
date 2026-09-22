// WhatsApp checkout-support helper.
//
// Builds a pre-filled WhatsApp message from the current cart/checkout state
// so a customer stuck on checkout can reach us with their order details
// already attached — no retyping what they just did.
//
// This is a SUPPORT channel, not a sales channel: it only appears on the
// checkout page, and the message is framed as a help request, not an order
// request, so it doesn't become a way to skip the cart and buy via DM.

import { formatNaira } from "@/lib/store";

// Business number for the checkout-help WhatsApp link.
// wa.me wants digits only, no "+", no spaces.
export const WHATSAPP_HELP_NUMBER = "2349155328133";

// Minimal shape covering both cart item types (original + print), matching
// what's already rendered in the checkout Order Summary. Kept loose/local
// rather than importing the full CartItem type so this helper doesn't need
// to track every field on the store — only what goes in the message.
export interface WhatsAppHelpItem {
  type: "original" | "print";
  title?: string; // originals
  frameName?: string;
  sizeLabel?: string; // prints
  price: number;
  quantity: number;
  set?: { pieces: unknown[] } | null; // prints — a set counts as N panels
}

interface BuildMessageOptions {
  items: WhatsAppHelpItem[];
  subtotal: number;
  shipping: number; // 0 if not yet quoted
  total: number;
  deliveryZoneLabel?: string; // e.g. "Ikeja" — omit if not chosen yet
  quoteOnRequest?: boolean; // true when delivery is "quoted after order"
  orderRef?: string; // only exists after an order has actually been created
}

function describeItem(item: WhatsAppHelpItem): string {
  const name =
    item.type === "original"
      ? item.title || "Original piece"
      : `Custom Print${item.sizeLabel ? ` (${item.sizeLabel})` : ""}`;

  const setNote =
    item.type === "print" && item.set && item.set.pieces.length > 1
      ? ` [set of ${item.set.pieces.length}]`
      : "";

  const qty = item.quantity > 1 ? ` x${item.quantity}` : "";

  return `- ${name}${setNote}${qty} — ${formatNaira(item.price * item.quantity)}`;
}

export function buildWhatsAppHelpMessage({
  items,
  subtotal,
  shipping,
  total,
  deliveryZoneLabel,
  quoteOnRequest,
  orderRef,
}: BuildMessageOptions): string {
  const lines: string[] = [];

  lines.push("Hi, I need help with my order/checkout:");
  lines.push("");
  items.forEach((item) => lines.push(describeItem(item)));
  lines.push("");
  lines.push(`Subtotal: ${formatNaira(subtotal)}`);

  if (deliveryZoneLabel) {
    lines.push(
      `Delivery (${deliveryZoneLabel}): ${
        quoteOnRequest ? "quoted after order" : formatNaira(shipping)
      }`,
    );
  }

  lines.push(`Total: ${formatNaira(total)}`);

  if (orderRef) {
    lines.push(`Order ref: ${orderRef}`);
  }

  return lines.join("\n");
}

export function getWhatsAppHelpUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_HELP_NUMBER}?text=${encodeURIComponent(message)}`;
}
