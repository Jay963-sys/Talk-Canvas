import "server-only";
import crypto from "crypto";

// Server side of Meta tracking (Conversions API).
// Fire this from the Paystack webhook for a reliable Purchase event that
// survives ad-blockers / iOS. De-duplicated against the browser Pixel by
// event_id — which for Purchase is the Paystack payment reference.

const GRAPH_VERSION = "v21.0"; // bump if Meta deprecates; check current version
const PIXEL_ID = process.env.META_PIXEL_ID; // same numeric id as the public one
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
// Optional: set while testing so events show under "Test events" in Events Manager.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Normalize + hash an email per Meta's spec (trim, lowercase). */
function hashEmail(email?: string | null) {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return normalized ? sha256(normalized) : undefined;
}

/** Normalize a phone to digits only (with country code, no +) then hash. */
function hashPhone(phone?: string | null) {
  if (!phone) return undefined;
  let digits = phone.replace(/[^\d]/g, "");
  // Nigeria: turn a local 0803... into 234803...
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return digits ? sha256(digits) : undefined;
}

/** Lowercase + strip spaces, then hash (used for first/last name). */
function hashName(name?: string | null) {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "");
  return normalized ? sha256(normalized) : undefined;
}

export type CapiContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type CapiCustomer = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  // Persist these on the order at checkout for best match quality (see notes):
  fbp?: string | null; // _fbp cookie
  fbc?: string | null; // _fbc cookie
  clientIp?: string | null;
  userAgent?: string | null;
};

function buildUserData(c: CapiCustomer) {
  const ud: Record<string, unknown> = {};
  const em = hashEmail(c.email);
  const ph = hashPhone(c.phone);
  const fn = hashName(c.firstName);
  const ln = hashName(c.lastName);
  if (em) ud.em = [em];
  if (ph) ud.ph = [ph];
  if (fn) ud.fn = [fn];
  if (ln) ud.ln = [ln];
  if (c.fbp) ud.fbp = c.fbp;
  if (c.fbc) ud.fbc = c.fbc;
  if (c.clientIp) ud.client_ip_address = c.clientIp;
  if (c.userAgent) ud.client_user_agent = c.userAgent;
  return ud;
}

/** Low-level sender. Returns { ok } — never throws into the webhook. */
async function sendEvent(payload: Record<string, unknown>) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[meta-capi] missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN");
    return { ok: false as const };
  }

  const body: Record<string, unknown> = { data: [payload] };
  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("[meta-capi] send failed", res.status, text);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("[meta-capi] send error", err);
    return { ok: false as const };
  }
}

/**
 * Purchase event for the Paystack webhook.
 * @param eventId  MUST be the Paystack payment reference (tcg_...) — same value
 *                 the browser passes as eventID, so Meta de-duplicates.
 */
export async function sendPurchase(input: {
  eventId: string;
  value: number;
  contents: CapiContent[];
  customer: CapiCustomer;
  eventSourceUrl?: string; // the order/success URL if you have it
}) {
  return sendEvent({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: buildUserData(input.customer),
    custom_data: {
      currency: "NGN",
      value: input.value,
      content_type: "product",
      contents: input.contents,
      content_ids: input.contents.map((c) => c.id),
      num_items: input.contents.reduce((n, c) => n + c.quantity, 0),
    },
  });
}
