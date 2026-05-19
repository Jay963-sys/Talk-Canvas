import { create } from "zustand";
import type { Frame } from "@/data/frames";
import type { PrintSize } from "@/data/sizes";

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

  setStep: (step: number) => void;
  setImage: (image: UploadedImage | null) => void;
  setFrame: (frame: Frame | null) => void;
  setSize: (size: PrintSize | null) => void;
  setArOpen: (open: boolean) => void;
  reset: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  step: 0,
  image: null,
  frame: null,
  size: null,
  arOpen: false,

  setStep: (step) => set({ step }),
  setImage: (image) => set({ image }),
  setFrame: (frame) => set({ frame }),
  setSize: (size) => set({ size }),
  setArOpen: (arOpen) => set({ arOpen }),
  reset: () =>
    set({
      step: 0,
      image: null,
      frame: null,
      size: null,
      arOpen: false,
    }),
}));

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
