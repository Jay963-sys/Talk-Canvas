import { NextRequest, NextResponse } from "next/server";
import {
  getAllArchivePrints,
  createArchivePrint,
} from "@/lib/db/queries/archivePrints";
import { requireSession } from "@/lib/auth-server";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getAllArchivePrints();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { imageUrl, imagePublicId, width, height } = body ?? {};

  if (
    typeof imageUrl !== "string" ||
    typeof imagePublicId !== "string" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const row = await createArchivePrint({
    imageUrl,
    imagePublicId,
    width,
    height,
  });
  return NextResponse.json(row, { status: 201 });
}
