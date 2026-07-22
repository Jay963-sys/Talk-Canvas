import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Crop } from "@/lib/crop";

/** Generous ceiling — guards against runaway input, not real customers. */
export const MAX_QUANTITY = 99;

export function clampQuantity(n: unknown): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_QUANTITY);
}

export interface PrintCartItem {
  id: string;
  type: "print";
  imageUrl: string;
  imagePublicId: string;
  frameId: string;
  frameName: string;
  glass: boolean;
  sizeId: string;
  sizeLabel: string;
  /**
   * Sizes are stored portrait; a landscape design uses them rotated. Carried
   * through to the order so the gallery frames the piece the right way round.
   */
  orientation: "portrait" | "landscape";
  /**
   * The crop the customer approved, as fractions of the source image. imageUrl
   * already has it baked in — this is kept for the record and for telling two
   * different crops of the same design apart.
   */
  crop: Crop;
  price: number;
  quantity: number;
  addedAt: string;
}

export interface OriginalCartItem {
  id: string;
  type: "original";
  originalId: number;
  slug: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  imagePublicId: string;
  frameName: string;
  glass: boolean;
  sizeLabel: string;
  price: number;
  quantity: number;
  /**
   * True for represented-artist works — only one exists, so quantity is locked
   * at 1 and the piece can never be added twice. Recreatable Talk Canvas
   * Originals are false and behave like prints.
   */
  oneOfOne: boolean;
  addedAt: string;
}

export type CartItem = PrintCartItem | OriginalCartItem;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    item: Omit<PrintCartItem, "id" | "addedAt" | "type" | "quantity">,
  ) => void;
  addOriginal: (
    item: Omit<OriginalCartItem, "id" | "addedAt" | "type" | "quantity">,
  ) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Same crop to the nearest 0.1% — avoids float noise splitting a line. */
function sameCrop(a: Crop, b: Crop): boolean {
  const r = (n: number) => Math.round(n * 1000);
  return (
    r(a.x) === r(b.x) &&
    r(a.y) === r(b.y) &&
    r(a.w) === r(b.w) &&
    r(a.h) === r(b.h)
  );
}

/**
 * Two prints are the same line if image + frame + glass + size + orientation +
 * crop all match. A different crop of the same design is a different product,
 * so it gets its own line.
 */
function samePrint(
  a: PrintCartItem,
  b: Omit<PrintCartItem, "id" | "addedAt" | "type" | "quantity">,
): boolean {
  return (
    a.imageUrl === b.imageUrl &&
    a.frameId === b.frameId &&
    a.glass === b.glass &&
    a.sizeId === b.sizeId &&
    a.orientation === b.orientation &&
    sameCrop(a.crop, b.crop)
  );
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          // Adding an identical configuration bumps the existing line rather
          // than stacking duplicate rows.
          const existing = state.items.find(
            (i): i is PrintCartItem => i.type === "print" && samePrint(i, item),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: clampQuantity(i.quantity + 1) }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                type: "print" as const,
                quantity: 1,
                id: genId(),
                addedAt: new Date().toISOString(),
              },
            ],
            isOpen: true,
          };
        }),

      addOriginal: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i): i is OriginalCartItem =>
              i.type === "original" && i.originalId === item.originalId,
          );

          if (existing) {
            // One-of-one: there's only ever one to sell — never increment.
            if (existing.oneOfOne) return { isOpen: true };
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: clampQuantity(i.quantity + 1) }
                  : i,
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                type: "original" as const,
                quantity: 1,
                id: genId(),
                addedAt: new Date().toISOString(),
              },
            ],
            isOpen: true,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            // One-of-one works are always exactly 1.
            if (i.type === "original" && i.oneOfOne) return i;
            return { ...i, quantity: clampQuantity(quantity) };
          }),
        })),

      increment: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.type === "original" && i.oneOfOne) return i;
            return { ...i, quantity: clampQuantity(i.quantity + 1) };
          }),
        })),

      decrement: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.type === "original" && i.oneOfOne) return i;
            return { ...i, quantity: clampQuantity(i.quantity - 1) };
          }),
        })),

      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "talk-canvas-cart",
      version: 6, // bumped — print items gained `crop`
      migrate: (persistedState, version) => {
        // Older carts predate quantity/oneOfOne/crop. Rather than guess, start clean.
        if (version < 6) return { items: [] };
        return persistedState as { items: CartItem[] };
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Line total for one cart item. */
export function lineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

/** Sum of all lines, quantity-aware. */
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/**
 * The portion an affiliate discount may apply to: prints and recreatable Talk
 * Canvas designs only. One-of-one artist works always pay full price.
 *
 * NOTE: this mirrors the authoritative rule in app/api/orders/route.ts. It's
 * for display only — the server always recomputes — but the two must agree or
 * the customer sees one total and is charged another.
 */
export function discountableSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    if (i.type === "original" && i.oneOfOne) return sum;
    return sum + i.price * i.quantity;
  }, 0);
}

/** Naira off, for a given percent. Floored — never round in the buyer's favour. */
export function discountFor(items: CartItem[], percent: number): number {
  const base = discountableSubtotal(items);
  return Math.max(0, Math.min(Math.floor((base * percent) / 100), base));
}

/** Total number of pieces (not lines) — for the header badge. */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
