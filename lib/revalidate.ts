import { revalidatePath } from "next/cache";

/**
 * Public pages are cached for a day (`revalidate = 86400`) to stay inside
 * Vercel's free-plan ISR limits. That makes this the thing that keeps them
 * fresh: call it after ANYTHING that changes what the storefront shows —
 * adding, editing, hiding or deleting an original, artist, archive print,
 * set or review, and when an original is sold.
 *
 * It marks every page stale; each is rebuilt once, on its next visit. Edits
 * are rare, so this costs a handful of ISR writes per edit instead of one per
 * page per minute. Never throws: a failed refresh must not fail the edit.
 */
export function revalidateStorefront(): void {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("revalidateStorefront failed", err);
  }
}
