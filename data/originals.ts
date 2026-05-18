export interface Original {
  id: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  size: string;
  price: string;
  img: string;
  description: string;
}

export const ORIGINALS: Original[] = [
  {
    id: "harmattan-light",
    title: "Harmattan Light",
    artist: "Adaeze Nwosu",
    year: 2024,
    medium: "Oil on canvas",
    size: "48 × 60 in",
    price: "Enquire",
    img: "https://picsum.photos/seed/painting11/700/900",
    description:
      "A study of atmospheric haze and warm afternoon light, exploring the particular quality of the dry season in the Nigerian interior.",
  },
  {
    id: "market-day",
    title: "Market Day",
    artist: "Tunde Bakare",
    year: 2023,
    medium: "Acrylic on linen",
    size: "36 × 48 in",
    price: "₦1,850,000",
    img: "https://picsum.photos/seed/painting22/800/600",
    description:
      "Composed from sketches made at Oyingbo market, this work captures movement and color without depicting any single figure.",
  },
  {
    id: "lagoon-dusk",
    title: "Lagoon, Dusk",
    artist: "Ifeoma Eze",
    year: 2024,
    medium: "Mixed media",
    size: "24 × 36 in",
    price: "₦920,000",
    img: "https://picsum.photos/seed/painting33/700/700",
    description:
      "A meditative landscape, built up in thin glazes over a textured ground.",
  },
  {
    id: "cloth-study-4",
    title: "Cloth Study No. 4",
    artist: "Adaeze Nwosu",
    year: 2024,
    medium: "Oil on canvas",
    size: "40 × 50 in",
    price: "₦1,200,000",
    img: "https://picsum.photos/seed/painting44/700/950",
    description:
      "Fourth in a series examining drape, weight, and the play of light across woven fabric.",
  },
  {
    id: "after-the-rain",
    title: "After the Rain",
    artist: "Kelechi Ofor",
    year: 2022,
    medium: "Watercolor",
    size: "20 × 28 in",
    price: "₦480,000",
    img: "https://picsum.photos/seed/painting55/700/550",
    description:
      "Plein-air watercolor completed in a single afternoon in Lekki, just after a storm broke.",
  },
  {
    id: "lagos-window",
    title: "Lagos Window",
    artist: "Tunde Bakare",
    year: 2024,
    medium: "Oil on canvas",
    size: "30 × 30 in",
    price: "₦760,000",
    img: "https://picsum.photos/seed/painting66/700/700",
    description:
      "A quiet interior, with the city compressed into the rectangle of an open window.",
  },
  {
    id: "mother-and-child",
    title: "Mother & Child",
    artist: "Ifeoma Eze",
    year: 2023,
    medium: "Charcoal",
    size: "22 × 30 in",
    price: "₦340,000",
    img: "https://picsum.photos/seed/painting77/700/850",
    description:
      "Worked entirely in compressed charcoal over a period of three sittings.",
  },
  {
    id: "iron-birds",
    title: "Iron Birds",
    artist: "Kelechi Ofor",
    year: 2024,
    medium: "Acrylic on board",
    size: "36 × 36 in",
    price: "₦680,000",
    img: "https://picsum.photos/seed/painting88/700/700",
    description:
      "Industrial motifs rendered with deliberate flatness, in conversation with mid-century West African modernism.",
  },
];

export function getOriginal(id: string): Original | undefined {
  return ORIGINALS.find((o) => o.id === id);
}
