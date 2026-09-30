"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ResolvedPlace } from "@/lib/delivery/resolvePlace";

type Suggestion = { placeId: string; main: string; secondary: string };

export interface ChosenAddress extends ResolvedPlace {
  /** What the customer picked, e.g. "8 Anifowose Street, Abule Egba, Lagos". */
  label: string;
  /** The first line of the suggestion, used to prefill the street field. */
  mainText: string;
}

const newToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function AddressAutocomplete({
  onChange,
}: {
  onChange: (address: ChosenAddress | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = useRef(newToken());
  const skipNextSearch = useRef(false);
  const hasSelection = useRef(false);

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
        if (!res.ok) throw new Error(data.error);
        setSuggestions(data.suggestions);
        setActive(-1);
        setError(null);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(
            "Address search isn't working right now. Try again, or message us on WhatsApp.",
          );
        }
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  async function choose(s: Suggestion) {
    const label = [s.main, s.secondary].filter(Boolean).join(", ");
    skipNextSearch.current = true;
    setQuery(label);
    setSuggestions([]);
    setResolving(true);
    setError(null);
    try {
      const res = await fetch("/api/delivery/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: s.placeId,
          sessionToken: sessionToken.current,
        }),
      });
      if (!res.ok) throw new Error();
      const place: ResolvedPlace = await res.json();
      onChange({ ...place, label, mainText: s.main });
    } catch {
      // Still let them order — delivery gets quoted by hand, same as the server will do.
      onChange({
        placeId: s.placeId,
        km: null,
        inLagos: null,
        minutes: null,
        formattedAddress: null,
        addressLine1: null,
        city: null,
        state: null,
        postalCode: null,
        label,
        mainText: s.main,
      });
    } finally {
      hasSelection.current = true;
      setResolving(false);
      sessionToken.current = newToken();
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
    } else if (e.key === "Enter") {
      e.preventDefault(); // never submit the checkout form from here
      if (active >= 0) choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  return (
    <div className="relative">
      <label
        htmlFor="deliveryAddress"
        className="block text-[10px] uppercase tracking-widest text-ink-soft font-semibold mb-2"
      >
        Start typing your address, then pick it from the list
      </label>
      <div className="relative">
        <input
          id="deliveryAddress"
          type="text"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="deliveryAddress-list"
          aria-activedescendant={
            active >= 0 ? `deliveryAddress-opt-${active}` : undefined
          }
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (hasSelection.current) {
              hasSelection.current = false;
              onChange(null);
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          className="w-full px-4 py-3 pr-10 bg-transparent border border-line focus:border-ink outline-none transition-colors text-[14px] text-ink"
        />
        {resolving && (
          <Loader2
            className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
            size={16}
            aria-label="Working out delivery"
          />
        )}
      </div>

      {suggestions.length > 0 && (
        <ul
          id="deliveryAddress-list"
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-72 overflow-auto border border-line bg-cream shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`deliveryAddress-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-3 ${i === active ? "bg-paper" : ""}`}
            >
              <span className="block text-[14px] text-ink">{s.main}</span>
              {s.secondary && (
                <span className="block text-[12px] text-ink-soft">
                  {s.secondary}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-[13px] text-red-600 mt-3">{error}</p>}
    </div>
  );
}
