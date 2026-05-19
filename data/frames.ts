export type FrameStyle = "regular" | "antique";
export type FrameShape = "floating" | "box";
export type FrameColor = "black" | "brown" | "gold" | "white";

export interface Frame {
  id: string;
  style: FrameStyle;
  shape: FrameShape | null; // null for antique (single shape)
  color: FrameColor;
  name: string;
  shortName: string;
  gradient: string;
  swatchColor: string; // hex — used for AR material
  glassAvailable: boolean;
  // Photo lives at /public/frames/<id>.jpg
  // UI falls back to the gradient if the file isn't present
  photo: string;
}

export const FRAMES: Frame[] = [
  // ── Regular Floating (4 colors, no glass option) ─────────────────
  {
    id: "regular-floating-black",
    style: "regular",
    shape: "floating",
    color: "black",
    name: "Floating · Black",
    shortName: "Floating Black",
    gradient: "linear-gradient(135deg, #2A2622 0%, #0F0D0B 100%)",
    swatchColor: "#1a1612",
    glassAvailable: false,
    photo: "/frames/regular-floating-black.jpg",
  },
  {
    id: "regular-floating-brown",
    style: "regular",
    shape: "floating",
    color: "brown",
    name: "Floating · Brown",
    shortName: "Floating Brown",
    gradient: "linear-gradient(135deg, #7a4f29 0%, #4a2e15 100%)",
    swatchColor: "#5c3a22",
    glassAvailable: false,
    photo: "/frames/regular-floating-brown.jpg",
  },
  {
    id: "regular-floating-gold",
    style: "regular",
    shape: "floating",
    color: "gold",
    name: "Floating · Gold",
    shortName: "Floating Gold",
    gradient: "linear-gradient(135deg, #d4b366 0%, #a07a3f 100%)",
    swatchColor: "#c9a66b",
    glassAvailable: false,
    photo: "/frames/regular-floating-gold.jpg",
  },
  {
    id: "regular-floating-white",
    style: "regular",
    shape: "floating",
    color: "white",
    name: "Floating · White",
    shortName: "Floating White",
    gradient: "linear-gradient(135deg, #F5F0E6 0%, #DCD5C7 100%)",
    swatchColor: "#e8e1d5",
    glassAvailable: false,
    photo: "/frames/regular-floating-white.jpg",
  },

  // ── Regular Box (4 colors, glass optional) ───────────────────────
  {
    id: "regular-box-black",
    style: "regular",
    shape: "box",
    color: "black",
    name: "Box · Black",
    shortName: "Box Black",
    gradient: "linear-gradient(135deg, #2A2622 0%, #0F0D0B 100%)",
    swatchColor: "#1a1612",
    glassAvailable: true,
    photo: "/frames/regular-box-black.jpg",
  },
  {
    id: "regular-box-brown",
    style: "regular",
    shape: "box",
    color: "brown",
    name: "Box · Brown",
    shortName: "Box Brown",
    gradient: "linear-gradient(135deg, #7a4f29 0%, #4a2e15 100%)",
    swatchColor: "#5c3a22",
    glassAvailable: true,
    photo: "/frames/regular-box-brown.jpg",
  },
  {
    id: "regular-box-gold",
    style: "regular",
    shape: "box",
    color: "gold",
    name: "Box · Gold",
    shortName: "Box Gold",
    gradient: "linear-gradient(135deg, #d4b366 0%, #a07a3f 100%)",
    swatchColor: "#c9a66b",
    glassAvailable: true,
    photo: "/frames/regular-box-gold.jpg",
  },
  {
    id: "regular-box-white",
    style: "regular",
    shape: "box",
    color: "white",
    name: "Box · White",
    shortName: "Box White",
    gradient: "linear-gradient(135deg, #F5F0E6 0%, #DCD5C7 100%)",
    swatchColor: "#e8e1d5",
    glassAvailable: true,
    photo: "/frames/regular-box-white.jpg",
  },

  // ── Antique (2 colors, glass always included in price) ───────────
  {
    id: "antique-black",
    style: "antique",
    shape: null,
    color: "black",
    name: "Antique · Black",
    shortName: "Antique Black",
    gradient: "linear-gradient(135deg, #1f1b18 0%, #0a0807 100%)",
    swatchColor: "#161312",
    glassAvailable: false, // already included
    photo: "/frames/antique-black.jpg",
  },
  {
    id: "antique-gold",
    style: "antique",
    shape: null,
    color: "gold",
    name: "Antique · Gold",
    shortName: "Antique Gold",
    gradient: "linear-gradient(135deg, #d4a559 0%, #8b6914 100%)",
    swatchColor: "#b8902c",
    glassAvailable: false, // already included
    photo: "/frames/antique-gold.jpg",
  },
];

export function getFrame(id: string): Frame | undefined {
  return FRAMES.find((f) => f.id === id);
}
