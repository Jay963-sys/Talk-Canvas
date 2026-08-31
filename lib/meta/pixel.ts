"use client";

// Client-side Meta Pixel helpers.
// The base script is injected by <MetaPixel /> (components/MetaPixel.tsx).
// These helpers only fire events — safe to call anywhere in client components.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const CURRENCY = "NGN";

type Params = Record<string, unknown>;

export type ContentItem = {
  id: string;
  quantity: number;
  item_price: number;
};

/** Fire any standard/custom event. Pass eventID to enable CAPI de-duplication. */
export function track(event: string, params: Params = {}, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) {
    window.fbq("track", event, params, { eventID });
  } else {
    window.fbq("track", event, params);
  }
}

export function pageview() {
  track("PageView");
}

export function viewContent(input: {
  id: string;
  name?: string;
  value: number;
  contentType?: "product" | "product_group";
}) {
  track("ViewContent", {
    content_ids: [input.id],
    content_type: input.contentType ?? "product",
    content_name: input.name,
    value: input.value,
    currency: CURRENCY,
  });
}

export function addToCart(input: {
  id: string;
  name?: string;
  value: number;
  quantity?: number;
}) {
  track("AddToCart", {
    content_ids: [input.id],
    content_type: "product",
    content_name: input.name,
    value: input.value,
    currency: CURRENCY,
    contents: [{ id: input.id, quantity: input.quantity ?? 1 }],
  });
}

export function initiateCheckout(input: {
  contents: ContentItem[];
  value: number;
}) {
  track("InitiateCheckout", {
    content_type: "product",
    contents: input.contents,
    content_ids: input.contents.map((c) => c.id),
    num_items: input.contents.reduce((n, c) => n + c.quantity, 0),
    value: input.value,
    currency: CURRENCY,
  });
}

/**
 * Browser side of the Purchase event.
 * IMPORTANT: eventID MUST equal the Paystack payment reference (e.g. tcg_...).
 * The webhook sends the same event_id via CAPI, and Meta de-duplicates the two.
 */
export function purchase(input: {
  paymentReference: string; // used as eventID — shared with the server
  contents: ContentItem[];
  value: number;
}) {
  track(
    "Purchase",
    {
      content_type: "product",
      contents: input.contents,
      content_ids: input.contents.map((c) => c.id),
      num_items: input.contents.reduce((n, c) => n + c.quantity, 0),
      value: input.value,
      currency: CURRENCY,
    },
    input.paymentReference,
  );
}

/**
 * Read Meta's browser identifiers so they can be stored on the order and sent
 * with the server-side (CAPI) Purchase — this is the single biggest lever on
 * match quality. Call at checkout, POST the result with the order.
 *
 * _fbp: set by the pixel on first visit.
 * _fbc: set by the pixel from an ad click. If it's missing but the URL still
 *       carries fbclid (a fresh click, pixel hasn't written the cookie yet),
 *       build the value in Meta's fb.1.<ts>.<fbclid> format so we don't lose it.
 */
export function getFbCookies(): { fbp: string | null; fbc: string | null } {
  if (typeof document === "undefined") return { fbp: null, fbc: null };

  const read = (name: string): string | null => {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
    return m ? decodeURIComponent(m[1]) : null;
  };

  let fbc = read("_fbc");
  if (!fbc && typeof window !== "undefined") {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  return { fbp: read("_fbp"), fbc };
}
