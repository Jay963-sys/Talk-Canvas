import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  frameId: string;
  frameName: string;
  sizeId: string;
  sizeName: string;
  sizeDims: string;
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
              id: crypto.randomUUID(),
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
      // Only persist items, not drawer open state
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
