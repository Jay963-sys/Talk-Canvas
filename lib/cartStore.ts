import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  price: number;
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
  addedAt: string;
}

export type CartItem = PrintCartItem | OriginalCartItem;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<PrintCartItem, "id" | "addedAt" | "type">) => void;
  addOriginal: (
    item: Omit<OriginalCartItem, "id" | "addedAt" | "type">,
  ) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              type: "print" as const,
              id: genId(),
              addedAt: new Date().toISOString(),
            },
          ],
          isOpen: true,
        })),

      addOriginal: (item) =>
        set((state) => {
          // One-of-one: never add the same original twice
          if (
            state.items.some(
              (i) => i.type === "original" && i.originalId === item.originalId,
            )
          ) {
            return { isOpen: true };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                type: "original" as const,
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

      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "talk-canvas-cart",
      version: 3, // bumped — clears old print-only carts that lack `type`
      migrate: (persistedState, version) => {
        if (version < 3) return { items: [] };
        return persistedState as { items: CartItem[] };
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
