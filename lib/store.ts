import { create } from "zustand";
import type { Frame } from "@/data/frames";
import type { PrintSize } from "@/data/sizes";

// At the top, alongside the other type imports:
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
  size: PrintSize | null;
  arOpen: boolean;
  ordered: boolean;

  setStep: (step: number) => void;
  setImage: (image: UploadedImage | null) => void;
  setFrame: (frame: Frame | null) => void;
  setSize: (size: PrintSize | null) => void;
  setArOpen: (open: boolean) => void;
  setOrdered: (ordered: boolean) => void;
  reset: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  step: 0,
  image: null,
  frame: null,
  size: null,
  arOpen: false,
  ordered: false,

  setStep: (step) => set({ step }),
  setImage: (image) => set({ image }),
  setFrame: (frame) => set({ frame }),
  setSize: (size) => set({ size }),
  setArOpen: (arOpen) => set({ arOpen }),
  setOrdered: (ordered) => set({ ordered }),
  reset: () =>
    set({
      step: 0,
      image: null,
      frame: null,
      size: null,
      arOpen: false,
      ordered: false,
    }),
}));

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
