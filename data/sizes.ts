export type SizeCategory = "small" | "medium" | "large" | "long";

export interface SizePrices {
  regular: number;
  regularGlass: number | null;
  antique: number | null;
}

export interface PrintSize {
  id: string;
  inches: { w: number; h: number };
  cm: { w: number; h: number };
  category: SizeCategory;
  prices: SizePrices;
}

export const SIZE_CATEGORIES: { id: SizeCategory; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
  { id: "long", label: "Long Canvas" },
];

export const SIZES: PrintSize[] = [
  // ── Small (smaller side < 24") ─────────────────────────────────
  {
    id: "12x16",
    inches: { w: 12, h: 16 },
    cm: { w: 30, h: 41 },
    category: "small",
    prices: { regular: 27000, regularGlass: 30000, antique: null },
  },
  {
    id: "16x16",
    inches: { w: 16, h: 16 },
    cm: { w: 41, h: 41 },
    category: "small",
    prices: { regular: 27000, regularGlass: 30000, antique: null },
  },
  {
    id: "16x20",
    inches: { w: 16, h: 20 },
    cm: { w: 41, h: 51 },
    category: "small",
    prices: { regular: 31000, regularGlass: 35000, antique: null },
  },
  {
    id: "18x24",
    inches: { w: 18, h: 24 },
    cm: { w: 46, h: 61 },
    category: "small",
    prices: { regular: 38000, regularGlass: 43000, antique: null },
  },
  {
    id: "20x30",
    inches: { w: 20, h: 30 },
    cm: { w: 51, h: 76 },
    category: "small",
    prices: { regular: 47000, regularGlass: 55000, antique: null },
  },
  {
    id: "20x40",
    inches: { w: 20, h: 40 },
    cm: { w: 51, h: 102 },
    category: "small",
    prices: { regular: 52000, regularGlass: 62000, antique: null },
  },

  // ── Medium (smaller side 24"–36") ──────────────────────────────
  {
    id: "24x36",
    inches: { w: 24, h: 36 },
    cm: { w: 61, h: 91 },
    category: "medium",
    prices: { regular: 52000, regularGlass: 62000, antique: null },
  },
  {
    id: "24x48",
    inches: { w: 24, h: 48 },
    cm: { w: 61, h: 122 },
    category: "medium",
    prices: { regular: 64000, regularGlass: 79000, antique: 129000 },
  },
  {
    id: "30x40",
    inches: { w: 30, h: 40 },
    cm: { w: 76, h: 102 },
    category: "medium",
    prices: { regular: 64000, regularGlass: 79000, antique: 129000 },
  },
  {
    id: "30x50",
    inches: { w: 30, h: 50 },
    cm: { w: 76, h: 127 },
    category: "medium",
    prices: { regular: 70000, regularGlass: 88000, antique: 137000 },
  },
  {
    id: "30x60",
    inches: { w: 30, h: 60 },
    cm: { w: 76, h: 152 },
    category: "medium",
    prices: { regular: 90000, regularGlass: 115000, antique: 163000 },
  },
  {
    id: "36x48",
    inches: { w: 36, h: 48 },
    cm: { w: 91, h: 122 },
    category: "medium",
    prices: { regular: 70000, regularGlass: 88000, antique: 137000 },
  },

  // ── Large (smaller side 40"–50") ───────────────────────────────
  {
    id: "40x60",
    inches: { w: 40, h: 60 },
    cm: { w: 102, h: 152 },
    category: "large",
    prices: { regular: 105000, regularGlass: 130000, antique: 178000 },
  },
  {
    id: "40x70",
    inches: { w: 40, h: 70 },
    cm: { w: 102, h: 178 },
    category: "large",
    prices: { regular: 120000, regularGlass: 150000, antique: 223000 },
  },
  {
    id: "40x80",
    inches: { w: 40, h: 80 },
    cm: { w: 102, h: 203 },
    category: "large",
    prices: { regular: 129000, regularGlass: 159000, antique: 231000 },
  },
  {
    id: "48x48",
    inches: { w: 48, h: 48 },
    cm: { w: 122, h: 122 },
    category: "large",
    prices: { regular: 105000, regularGlass: 130000, antique: 178000 },
  },
  {
    id: "48x72",
    inches: { w: 48, h: 72 },
    cm: { w: 122, h: 183 },
    category: "large",
    prices: { regular: 129000, regularGlass: 159000, antique: 231000 },
  },
  {
    id: "48x84",
    inches: { w: 48, h: 84 },
    cm: { w: 122, h: 213 },
    category: "large",
    prices: { regular: 147000, regularGlass: 182000, antique: 280000 },
  },
  {
    id: "50x90",
    inches: { w: 50, h: 90 },
    cm: { w: 127, h: 229 },
    category: "large",
    prices: { regular: 205000, regularGlass: null, antique: 297000 },
  },

  // ── Long Canvas (smaller side 60"+) ────────────────────────────
  {
    id: "60x60",
    inches: { w: 60, h: 60 },
    cm: { w: 152, h: 152 },
    category: "long",
    prices: { regular: 275000, regularGlass: null, antique: 436000 },
  },
  {
    id: "60x72",
    inches: { w: 60, h: 72 },
    cm: { w: 152, h: 183 },
    category: "long",
    prices: { regular: 329000, regularGlass: null, antique: 436000 },
  },
  {
    id: "60x84",
    inches: { w: 60, h: 84 },
    cm: { w: 152, h: 213 },
    category: "long",
    prices: { regular: 378000, regularGlass: null, antique: 481000 },
  },
  {
    id: "60x90",
    inches: { w: 60, h: 90 },
    cm: { w: 152, h: 229 },
    category: "long",
    prices: { regular: 407000, regularGlass: null, antique: 507000 },
  },
  {
    id: "72x72",
    inches: { w: 72, h: 72 },
    cm: { w: 183, h: 183 },
    category: "long",
    prices: { regular: 378000, regularGlass: null, antique: 481000 },
  },
  {
    id: "72x96",
    inches: { w: 72, h: 96 },
    cm: { w: 183, h: 244 },
    category: "long",
    prices: { regular: 445000, regularGlass: null, antique: 544000 },
  },
  {
    id: "84x84",
    inches: { w: 84, h: 84 },
    cm: { w: 213, h: 213 },
    category: "long",
    prices: { regular: 445000, regularGlass: null, antique: 544000 },
  },
];

export function getSize(id: string): PrintSize | undefined {
  return SIZES.find((s) => s.id === id);
}

// Display helpers
export function formatInches(s: PrintSize): string {
  return `${s.inches.w} × ${s.inches.h} in`;
}

export function formatCm(s: PrintSize): string {
  return `${s.cm.w} × ${s.cm.h} cm`;
}
