import { NextResponse } from "next/server";
import { getArchiveCollections } from "@/lib/db/queries/archivePrints";

export const dynamic = "force-dynamic";

export async function GET() {
  const collections = await getArchiveCollections();
  return NextResponse.json(collections);
}
