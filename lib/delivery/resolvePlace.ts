// SERVER ONLY — uses map API keys. Don't import this from client components
// (a `import type` is fine).
//
// Two providers, picked by GEO_PROVIDER ("geoapify" | "google").
// Default: google if GOOGLE_MAPS_API_KEY is set, otherwise geoapify.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { DeliveryDestination } from "@/lib/deliveryCalc";

export interface ResolvedPlace extends DeliveryDestination {
  placeId: string;
  minutes: number | null;
  formattedAddress: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

export type Suggestion = { placeId: string; main: string; secondary: string };

export function geoProvider(): "google" | "geoapify" {
  const p = process.env.GEO_PROVIDER;
  if (p === "google" || p === "geoapify") return p;
  return process.env.GOOGLE_MAPS_API_KEY ? "google" : "geoapify";
}

export function isPlaceId(v: unknown): v is string {
  // Google ids are ~30–300 chars; Geoapify ids are long hex strings.
  return typeof v === "string" && /^[\w-]{10,2000}$/.test(v);
}

function shopCoords() {
  const lat = Number(process.env.SHOP_LAT);
  const lng = Number(process.env.SHOP_LNG);
  return process.env.SHOP_LAT &&
    process.env.SHOP_LNG &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
    ? { lat, lng }
    : null;
}

const emptyPlace = (placeId: string): ResolvedPlace => ({
  placeId,
  km: null,
  inLagos: null,
  minutes: null,
  formattedAddress: null,
  addressLine1: null,
  city: null,
  state: null,
  postalCode: null,
});

const toKm = (meters: number) => Math.round((meters / 1000) * 10) / 10;

// ───────────────────────── Signed Geoapify ids ─────────────────────────
// Geoapify's place-details endpoint returns nothing for most street
// addresses, so an autocomplete result can't be looked up again by id.
// Instead the autocomplete route packs the result's coordinates and address
// into the id and signs it. The browser only ever passes it back; a tampered
// or expired id fails verification and the order goes to a manual quote.

type SignedPlace = {
  lat: number;
  lon: number;
  state: string | null;
  stateCode: string | null;
  cc: string | null;
  city: string | null;
  postcode: string | null;
  line1: string | null;
  formatted: string | null;
  iat: number;
};

const SIG_LEN = 43; // sha256 in base64url
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // a cart can sit open for a day

function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret + ":delivery-place";
}

function signPlace(data: Omit<SignedPlace, "iat">): string {
  const payload = Buffer.from(
    JSON.stringify({ ...data, iat: Date.now() }),
  ).toString("base64url");
  const sig = createHmac("sha256", signingKey())
    .update(payload)
    .digest("base64url");
  return payload + sig;
}

function verifyPlace(id: string): SignedPlace | null {
  if (id.length <= SIG_LEN) return null;
  const payload = id.slice(0, -SIG_LEN);
  const sig = Buffer.from(id.slice(-SIG_LEN));
  const expected = Buffer.from(
    createHmac("sha256", signingKey()).update(payload).digest("base64url"),
  );
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected))
    return null;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as SignedPlace;
    if (Date.now() - data.iat > MAX_AGE_MS) return null;
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lon)) return null;
    return data;
  } catch {
    return null;
  }
}

// ───────────────────────── Autocomplete ─────────────────────────

/** Throws on provider failure so the route can return a 502. */
export async function autocompleteAddress(
  input: string,
  sessionToken?: string,
): Promise<Suggestion[]> {
  return geoProvider() === "google"
    ? googleAutocomplete(input, sessionToken)
    : geoapifyAutocomplete(input);
}

async function geoapifyAutocomplete(input: string): Promise<Suggestion[]> {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) throw new Error("GEOAPIFY_API_KEY is not set");
  const shop = shopCoords();

  const params = new URLSearchParams({
    text: input,
    filter: "countrycode:ng",
    format: "json",
    limit: "6",
    apiKey: key,
  });
  if (shop) params.set("bias", `proximity:${shop.lng},${shop.lat}`); // lon,lat order

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
    {
      cache: "no-store",
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      `Geoapify autocomplete ${res.status}: ${JSON.stringify(data)}`,
    );

  type R = {
    lat?: number;
    lon?: number;
    address_line1?: string;
    address_line2?: string;
    formatted?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    suburb?: string;
    county?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
    country_code?: string;
  };
  return ((data.results ?? []) as R[])
    .filter(
      (r): r is R & { lat: number; lon: number } =>
        Number.isFinite(r.lat) && Number.isFinite(r.lon),
    )
    .map((r) => ({
      placeId: signPlace({
        lat: r.lat,
        lon: r.lon,
        state: r.state ?? null,
        stateCode: r.state_code ?? null,
        cc: r.country_code ?? null,
        city: r.city ?? r.suburb ?? r.county ?? null,
        postcode: r.postcode ?? null,
        line1:
          [r.housenumber, r.street].filter(Boolean).join(" ") ||
          r.address_line1 ||
          null,
        formatted: r.formatted ?? null,
      }),
      main: r.address_line1 ?? r.formatted ?? "",
      secondary: r.address_line2 ?? "",
    }));
}

async function googleAutocomplete(
  input: string,
  sessionToken?: string,
): Promise<Suggestion[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  const shop = shopCoords();

  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
      body: JSON.stringify({
        input,
        sessionToken,
        includedRegionCodes: ["ng"],
        ...(shop
          ? {
              locationBias: {
                circle: {
                  center: { latitude: shop.lat, longitude: shop.lng },
                  radius: 50000,
                },
              },
            }
          : {}),
      }),
      cache: "no-store",
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      `Google autocomplete ${res.status}: ${JSON.stringify(data)}`,
    );

  type P = {
    placeId: string;
    text?: { text: string };
    structuredFormat?: {
      mainText?: { text: string };
      secondaryText?: { text: string };
    };
  };
  return ((data.suggestions ?? []) as { placePrediction?: P }[])
    .map((s) => s.placePrediction)
    .filter((p): p is P => Boolean(p?.placeId))
    .map((p) => ({
      placeId: p.placeId,
      main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
    }));
}

// ───────────────────────── Resolve + distance ─────────────────────────

/**
 * Looks up a place and measures the drive from the studio.
 * Never throws: on any failure the unknown fields come back null, which
 * quoteDeliveryByDistance turns into a manual quote instead of a failed order.
 */
export async function resolveDeliveryPlace(
  placeId: string,
  sessionToken?: string,
): Promise<ResolvedPlace> {
  try {
    return geoProvider() === "google"
      ? await googleResolve(placeId, sessionToken)
      : await geoapifyResolve(placeId);
  } catch (e) {
    console.error("resolveDeliveryPlace failed", e);
    return emptyPlace(placeId);
  }
}

async function geoapifyResolve(placeId: string): Promise<ResolvedPlace> {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) {
    console.error("resolveDeliveryPlace: GEOAPIFY_API_KEY is not set");
    return emptyPlace(placeId);
  }

  // 1. Unpack the signed id from our autocomplete route.
  const place = verifyPlace(placeId);
  if (!place) {
    console.error("resolveDeliveryPlace: invalid or expired place id");
    return emptyPlace(placeId);
  }
  const { lat, lon } = place;
  const isLagosState =
    /lagos/i.test(place.state ?? "") || place.stateCode?.toUpperCase() === "LA";

  const base: ResolvedPlace = {
    ...emptyPlace(placeId),
    formattedAddress: place.formatted,
    addressLine1: place.line1,
    city: place.city,
    state: place.state ?? (isLagosState ? "Lagos" : place.stateCode),
    postalCode: place.postcode,
    inLagos:
      place.state || place.stateCode ? place.cc === "ng" && isLagosState : null,
  };

  // 2. Driving route from the studio.
  const shop = shopCoords();
  if (!shop) {
    console.error("resolveDeliveryPlace: set SHOP_LAT and SHOP_LNG");
    return base;
  }
  const rRes = await fetch(
    `https://api.geoapify.com/v1/routing?${new URLSearchParams({
      waypoints: `${shop.lat},${shop.lng}|${lat},${lon}`, // lat,lon order here
      mode: "drive",
      apiKey: key,
    })}`,
    { cache: "no-store" },
  );
  const rData = await rRes.json();
  const route = rData.features?.[0]?.properties;
  if (!rRes.ok || !route?.distance) {
    console.error("Geoapify routing failed", rData);
    return base;
  }

  return {
    ...base,
    km: toKm(route.distance),
    minutes:
      typeof route.time === "number" ? Math.round(route.time / 60) : null,
  };
}

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

async function googleResolve(
  placeId: string,
  sessionToken?: string,
): Promise<ResolvedPlace> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.error("resolveDeliveryPlace: GOOGLE_MAPS_API_KEY is not set");
    return emptyPlace(placeId);
  }

  const qs = sessionToken
    ? `?sessionToken=${encodeURIComponent(sessionToken)}`
    : "";
  const pRes = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}${qs}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "formattedAddress,addressComponents,location",
      },
      cache: "no-store",
    },
  );
  if (!pRes.ok) {
    console.error("Google place details failed", await pRes.text());
    return emptyPlace(placeId);
  }
  const place = await pRes.json();
  const comps: AddressComponent[] = place.addressComponents ?? [];
  const get = (type: string) =>
    comps.find((c) => c.types?.includes(type))?.longText ?? null;
  const state = get("administrative_area_level_1");
  const country = comps.find((c) => c.types?.includes("country"))?.shortText;
  const street = [get("street_number"), get("route")].filter(Boolean).join(" ");

  const base: ResolvedPlace = {
    ...emptyPlace(placeId),
    formattedAddress: place.formattedAddress ?? null,
    addressLine1: street || null,
    city:
      get("locality") ??
      get("sublocality") ??
      get("administrative_area_level_2"),
    state,
    postalCode: get("postal_code"),
    inLagos: state ? country === "NG" && /lagos/i.test(state) : null,
  };

  const shop = shopCoords();
  const origin = shop
    ? { location: { latLng: { latitude: shop.lat, longitude: shop.lng } } }
    : process.env.SHOP_ADDRESS
      ? { address: process.env.SHOP_ADDRESS }
      : null;
  const loc = place.location;
  if (!origin || !loc) {
    if (!origin)
      console.error(
        "resolveDeliveryPlace: set SHOP_LAT/SHOP_LNG or SHOP_ADDRESS",
      );
    return base;
  }

  const rRes = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin,
        destination: {
          location: {
            latLng: { latitude: loc.latitude, longitude: loc.longitude },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE", // we charge on distance only
      }),
      cache: "no-store",
    },
  );
  const data = await rRes.json();
  const route = data.routes?.[0];
  if (!rRes.ok || !route?.distanceMeters) {
    console.error("Google Routes failed", data);
    return base;
  }
  const seconds = parseInt(String(route.duration ?? "").replace("s", ""), 10);
  return {
    ...base,
    km: toKm(route.distanceMeters),
    minutes: Number.isFinite(seconds) ? Math.round(seconds / 60) : null,
  };
}
