export interface PrintSize {
  id: string;
  name: string;
  dims: string;
  basePrice: number; // in NGN
}

export const SIZES: PrintSize[] = [
  { id: "a4", name: "A4", dims: "21 × 30 cm", basePrice: 12000 },
  { id: "a3", name: "A3", dims: "30 × 42 cm", basePrice: 22000 },
  { id: "a2", name: "A2", dims: "42 × 59 cm", basePrice: 38000 },
  { id: "a1", name: "A1", dims: "59 × 84 cm", basePrice: 62000 },
];
