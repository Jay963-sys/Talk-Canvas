export const ARCHIVE_COLLECTIONS = [
  "Lagos Streetlife",
  "Portraits",
  "Diaspora",
  "Abstract",
  "Market Scenes",
] as const;

export type ArchiveCollection = (typeof ARCHIVE_COLLECTIONS)[number];
