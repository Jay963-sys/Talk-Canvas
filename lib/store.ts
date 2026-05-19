import { create } from "zustand";
import type { Frame } from "@/data/frames";
import type { PrintSize } from "@/data/sizes";
import { getPriceTier } from "@/data/pricing";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

interface ConfiguratorState {
  step: number;
  image: UploadedImage | null;
  frame: Frame | null;
  glass: boolean;
  size: PrintSize | null;
  arOpen: boolean;

  setStep: (step: number) => void;
  setImage: (image: UploadedImage | null) => void;
  setFrame: (frame: Frame | null) => void;
  setGlass: (glass: boolean) => void;
  setSize: (size: PrintSize | null) => void;
  setArOpen: (open: boolean) => void;
  reset: () => void;
}

// If a size becomes incompatible with the current frame+glass, clear it
function clearSizeIfInvalid(
  size: PrintSize | null,
  frame: Frame | null,
  glass: boolean,
): PrintSize | null {
  if (!size || !frame) return size;
  const tier = getPriceTier(frame, glass);
  return size.prices[tier] !== null ? size : null;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  step: 0,
  image: null,
  frame: null,
  glass: false,
  size: null,
  arOpen: false,

  setStep: (step) => set({ step }),
  setImage: (image) => set({ image }),
  setFrame: (frame) =>
    set((state) => {
      // Glass only available on regular box; force off otherwise
      const glass = frame?.shape === "box" ? state.glass : false;
      const size = clearSizeIfInvalid(state.size, frame, glass);
      return { frame, glass, size };
    }),
  setGlass: (glass) =>
    set((state) => {
      const size = clearSizeIfInvalid(state.size, state.frame, glass);
      return { glass, size };
    }),
  setSize: (size) => set({ size }),
  setArOpen: (arOpen) => set({ arOpen }),
  reset: () =>
    set({
      step: 0,
      image: null,
      frame: null,
      glass: false,
      size: null,
      arOpen: false,
    }),
}));

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
