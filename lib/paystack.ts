import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export function paystackEnabled(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{
  authorization_url: string;
  access_code: string;
  reference: string;
}> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo, // Paystack works in kobo
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json?.message || "Paystack initialize failed");
  }
  return json.data;
}

export async function verifyTransaction(reference: string): Promise<{
  status: string;
  amount: number;
  reference: string;
  currency: string;
}> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  );
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json?.message || "Paystack verify failed");
  }
  return json.data;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}
