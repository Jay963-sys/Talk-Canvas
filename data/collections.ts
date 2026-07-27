// ── ARCHIVE CATEGORIES ──────────────────────────────────────────
// The client-approved taxonomy for archive designs. Stored in the existing
// `archive_prints.collection` column — this is the same concept the column was
// always for, so no migration is needed; only the value list and the UI label
// change ("Collection" → "Category").
//
// Slugs are what live in the database and in URLs. Labels are display-only, so
// the gallery can reword a category later without touching a single row.
//
// This is an independent axis from orientation. Orientation is derived from
// each image's pixel dimensions and is never tagged by hand; a design is
// "Abstract + Landscape", not "Abstract" instead of "Landscape".

export const ARCHIVE_CATEGORIES = [
  { slug: "abstract", label: "Abstract" },
  { slug: "minimalistic", label: "Minimalistic" },
  { slug: "pop", label: "Pop" },
  { slug: "typographic", label: "Typographic" },
  // Named "Nature and landscape" in the group chat. Renamed here so it can't be
  // read as the landscape *orientation* sitting in the same filter bar.
  { slug: "nature", label: "Nature & Scenery" },
  { slug: "monochrome", label: "Monochrome" },
  { slug: "afrocentric", label: "Afrocentric" },
  { slug: "cartoon-anime", label: "Cartoon & Anime" },
  { slug: "others", label: "Others" },
] as const;

export type ArchiveCategory = (typeof ARCHIVE_CATEGORIES)[number]["slug"];

/** Fallback for anything uploaded before categories existed. */
export const DEFAULT_ARCHIVE_CATEGORY: ArchiveCategory = "others";

const SLUGS = new Set<string>(ARCHIVE_CATEGORIES.map((c) => c.slug));

/** Narrows an untrusted query param / form value to a real category. */
export function isArchiveCategory(
  value: string | null | undefined,
): value is ArchiveCategory {
  return typeof value === "string" && SLUGS.has(value);
}

/** Display name for a stored slug. Unknown or missing values read as "Others". */
export function archiveCategoryLabel(
  slug: string | null | undefined,
): string {
  return (
    ARCHIVE_CATEGORIES.find((c) => c.slug === slug)?.label ?? "Others"
  );
}
