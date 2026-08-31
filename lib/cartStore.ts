import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Crop } from "@/lib/crop";
import { addToCart as trackAddToCart } from "@/lib/meta/pixel";

/** Generous ceiling — guards against runaway input, not real customers. */
export const MAX_QUANTITY = 99;

export function clampQuantity(n: unknown): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_QUANTITY);
}

/** One panel of a set. Frame, glass and size live on the line, not here — the
 *  gallery's rule is that every piece takes the same ones. */
export interface SetPiece {
  imageUrl: string;
  imagePublicId: string;
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
  /**
   * Set membership, or null for an ordinary single print.
   *
   * A set is ONE line, not one line per panel: the gallery sells them
   * all-or-nothing, and separate lines would let a customer delete one panel
   * and check out with two-thirds of a triptych. `pieces` carries every panel
   * so the order can be expanded into individual items for printing, and
   * `imageUrl` above stays the canonical panel for thumbnails.
   *
   * `price` on this line is the whole-set price (unit price × pieces.length),
   * which keeps quantity meaning what it always meant: how many sets.
   */
  set: {
    setId: number;
    pieces: SetPiece[];
  } | null;
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
 *
 * Sets compare on setId: two lines of the same set in the same frame and size
 * are the same product, and a set never merges with a loose print even when
 * the canonical panel's image matches.
 */
function samePrint(
  a: PrintCartItem,
  b: Omit<PrintCartItem, "id" | "addedAt" | "type" | "quantity">,
): boolean {
  if ((a.set?.setId ?? null) !== (b.set?.setId ?? null)) return false;
  return (
    a.imageUrl === b.imageUrl &&
    a.frameId === b.frameId &&
    a.glass === b.glass &&
    a.sizeId === b.sizeId &&
    a.orientation === b.orientation &&
    sameCrop(a.crop, b.crop)
  );
}

/** Panels in one unit of this line: 3 for a triptych, 1 for a single print. */
export function piecesPerUnit(item: CartItem): number {
  if (item.type === "print" && item.set) {
    return Math.max(1, item.set.pieces.length);
  }
  return 1;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        // Meta AddToCart — fired at the single choke point every print add goes
        // through. Guarded internally, so it's a no-op during SSR/hydration.
        trackAddToCart({
          id: item.set ? `set_${item.set.setId}` : "print",
          name: item.frameName,
          value: item.price,
        });
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
        });
      },

      addOriginal: (item) => {
        trackAddToCart({
          id: `original_${item.originalId}`,
          name: item.title,
          value: item.price,
        });
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
        });
      },

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
      version: 7, // bumped — print items gained `set`
      migrate: (persistedState, version) => {
        // Older carts predate quantity/oneOfOne/crop/set. Rather than guess,
        // start clean.
        if (version < 7) return { items: [] };
        return persistedState as { items: CartItem[] };
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Line total for one cart item. For a set, `price` is already the set price. */
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

/**
 * Total number of framed pieces — for the header badge. A triptych counts as
 * three, because three frames are what turn up at the door.
 */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + piecesPerUnit(i) * i.quantity, 0);
}

/** True when the cart holds a set, so delivery has to be quoted by hand. */
export function cartHasSet(items: CartItem[]): boolean {
  return items.some((i) => i.type === "print" && i.set !== null);
}
