"use client";

import { useEffect, useRef, useState } from "react";
import {
  calcDistanceFee,
  DEFAULT_DISTANCE_PRICING,
  type DistancePricing,
} from "../../lib/distanceDelivery";

type Suggestion = { placeId: string; main: string; secondary: string };
type RouteInfo = { km: number; minutes: number | null; address: string };

const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

const newToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const PRICING_FIELDS: { key: keyof DistancePricing; label: string }[] = [
  { key: "baseFee", label: "Base fee" },
  { key: "perKm", label: "Per km" },
  { key: "minFee", label: "Minimum" },
  { key: "maxFee", label: "Maximum" },
];

export default function DistanceDemo() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<DistancePricing>(
    DEFAULT_DISTANCE_PRICING,
  );

  const sessionToken = useRef(newToken());
  const skipNextSearch = useRef(false);

  // Debounced address search
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/delivery/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: q,
            sessionToken: sessionToken.current,
          }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Address search failed");
        setSuggestions(data.suggestions);
        setActive(-1);
        setError(null);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  async function choose(s: Suggestion) {
    const address = [s.main, s.secondary].filter(Boolean).join(", ");
    skipNextSearch.current = true;
    setQuery(address);
    setSuggestions([]);
    setMeasuring(true);
    setError(null);
    try {
      const res = await fetch("/api/delivery/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: s.placeId }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Could not measure the distance");
      setRoute({ km: data.km, minutes: data.minutes, address });
    } catch (e) {
      setRoute(null);
      setError((e as Error).message);
    } finally {
      setMeasuring(false);
      sessionToken.current = newToken(); // one billing session per chosen address
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  const quote = route ? calcDistanceFee(route.km, pricing) : null;

  return (
    <div className="mt-10 space-y-10">
      {/* Address search */}
      <div className="relative">
        <label htmlFor="delivery-address" className="block text-sm font-medium">
          Delivery address
        </label>
        <input
          id="delivery-address"
          type="text"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="delivery-suggestions"
          aria-activedescendant={
            active >= 0 ? `delivery-opt-${active}` : undefined
          }
          autoComplete="off"
          placeholder="e.g. 12 Admiralty Way, Lekki"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
        />
        {suggestions.length > 0 && (
          <ul
            id="delivery-suggestions"
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.placeId}
                id={`delivery-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-neutral-100" : ""}`}
              >
                <span className="block text-sm font-medium">{s.main}</span>
                {s.secondary && (
                  <span className="block text-xs text-neutral-500">
                    {s.secondary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Result */}
      <section aria-live="polite" className="border-t border-neutral-200 pt-8">
        {measuring && <p className="text-neutral-500">Measuring the route…</p>}

        {!measuring && !quote && (
          <p className="text-neutral-500">
            Pick an address to see the delivery fee.
          </p>
        )}

        {!measuring && quote && route && (
          <div>
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <span className="shrink-0">Studio</span>
              <span className="relative h-px flex-1 bg-neutral-400">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap bg-transparent pb-1 font-medium text-neutral-900">
                  {route.km} km
                  {route.minutes != null ? ` · about ${route.minutes} min` : ""}
                </span>
              </span>
              <span className="max-w-[45%] truncate" title={route.address}>
                {route.address}
              </span>
            </div>

            <p className="mt-8 text-5xl font-semibold tracking-tight sm:text-6xl">
              {naira(quote.fee)}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {naira(pricing.baseFee)} base + {route.km} km ×{" "}
              {naira(pricing.perKm)} = {naira(quote.raw)}
              {quote.capped && `, capped at ${naira(pricing.maxFee)}`}
              {quote.floored &&
                `, raised to the ${naira(pricing.minFee)} minimum`}
            </p>
          </div>
        )}
      </section>

      {/* Pricing knobs */}
      <section className="border-t border-neutral-200 pt-8">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Try different rates. Changes here are for this demo only and
          aren&apos;t saved.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PRICING_FIELDS.map(({ key, label }) => (
            <label key={key} className="block text-sm">
              <span className="text-neutral-700">{label} (₦)</span>
              <input
                type="number"
                min={0}
                step={50}
                value={pricing[key]}
                onChange={(e) =>
                  setPricing((p) => ({
                    ...p,
                    [key]: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
