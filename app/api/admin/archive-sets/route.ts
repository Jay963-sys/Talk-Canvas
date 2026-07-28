import { NextRequest, NextResponse } from "next/server";
import { createArchiveSet } from "@/lib/db/queries/archivePrints";
import { requireSession } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ids = body?.ids;

  if (
    !Array.isArray(ids) ||
    ids.length < 2 ||
    !ids.every((id) => typeof id === "number" && Number.isInteger(id))
  ) {
    return NextResponse.json(
      { error: "Give at least two print ids, in hanging order." },
      { status: 400 },
    );
  }

  try {
    const setId = await createArchiveSet(ids);
    return NextResponse.json({ setId }, { status: 201 });
  } catch (err) {
    // createArchiveSet throws messages written to be read by staff — mixed
    // orientations, pieces already in a set, pieces since deleted. Pass them
    // through rather than flattening them into "something went wrong".
    const message =
      err instanceof Error ? err.message : "Couldn't group those pieces.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
