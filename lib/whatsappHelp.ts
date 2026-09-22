import { formatNaira } from "@/lib/store";

export const WHATSAPP_HELP_NUMBER = "2349155328133";

export interface WhatsAppHelpItem {
  type: "original" | "print";
  title?: string;
  frameName?: string;
  sizeLabel?: string;
  price: number;
  quantity: number;
  set?: { pieces: unknown[] } | null;
}

interface BuildMessageOptions {
  items: WhatsAppHelpItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryZoneLabel?: string;
  quoteOnRequest?: boolean;
  orderRef?: string;
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
