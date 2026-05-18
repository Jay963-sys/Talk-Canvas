export interface Frame {
  id: string;
  name: string;
  desc: string;
  swatch: string;
  priceMultiplier: number;
}

export const FRAMES: Frame[] = [
  {
    id: "oak",
    name: "Natural Oak",
    desc: "Warm wood grain, beveled edge",
    swatch: "linear-gradient(135deg, #C9A66B 0%, #A07A3F 100%)",
    priceMultiplier: 1.0,
  },
  {
    id: "black",
    name: "Matte Black",
    desc: "Modern minimal, gallery standard",
    swatch: "linear-gradient(135deg, #2A2622 0%, #0F0D0B 100%)",
    priceMultiplier: 1.05,
  },
  {
    id: "white",
    name: "Soft White",
    desc: "Bright, clean, classic",
    swatch: "linear-gradient(135deg, #F5F0E6 0%, #DCD5C7 100%)",
    priceMultiplier: 1.0,
  },
  {
    id: "walnut",
    name: "Dark Walnut",
    desc: "Rich tone, heritage feel",
    swatch: "linear-gradient(135deg, #5C3A22 0%, #2E1D12 100%)",
    priceMultiplier: 1.15,
  },
];
