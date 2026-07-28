import type { ConfiguratorSet } from "@/lib/store";

interface SetResponse {
  setId: number;
  pieces: {
    imageUrl: string;
    imagePublicId: string;
    width: number;
    height: number;
  }[];
}

/**
 * Load every panel of a set, ready for the configurator.
 *
 * Two places need this — the archive grid tile and the picker inside the
 * configurator — and both must end up with identical data, since whichever one
 * the customer used decides what the order contains. Keeping the fetch and the
 * field mapping in one place is what stops those two drifting apart.
 *
 * Throws a message fit to show the customer.
 */
export async function fetchArchiveSet(setId: number): Promise<ConfiguratorSet> {
  const res = await fetch(`/api/archive-sets/${setId}`);
  if (!res.ok) throw new Error("That set is no longer available.");

  const data: SetResponse = await res.json();
  return {
    setId: data.setId,
    pieces: data.pieces.map((p) => ({
      url: p.imageUrl,
      publicId: p.imagePublicId,
      width: p.width,
      height: p.height,
    })),
  };
}
