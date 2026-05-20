import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
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

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
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
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              addedAt: new Date().toISOString(),
            },
          ],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "talk-canvas-cart",
      version: 2,
      migrate: (_persistedState, version) => {
        if (version < 2) return { items: [] };
        return _persistedState as { items: CartItem[] };
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
