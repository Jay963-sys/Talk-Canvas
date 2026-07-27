
  import { NextRequest, NextResponse } from "next/server";
import {
  getAllArchivePrints,
  createArchivePrint,
} from "@/lib/db/queries/archivePrints";
import { requireSession } from "@/lib/auth-server";
import { isArchiveCategory } from "@/data/collections";

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
  const { imageUrl, imagePublicId, width, height, category } = body ?? {};

  if (
    typeof imageUrl !== "string" ||
    typeof imagePublicId !== "string" ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    (category !== undefined && typeof category !== "string")
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // An unrecognized category falls back to "others" instead of failing the
  // request. This is deliberately more forgiving than the PATCH route: by the
  // time we get here the image is already in Cloudinary, and a mistagged
  // upload is fixable from the admin grid in one dropdown, whereas a rejected
  // one costs the whole transfer. PATCH has no such sunk cost, so it rejects.
  const row = await createArchivePrint({
    imageUrl,
    imagePublicId,
    width,
    height,
    category: isArchiveCategory(category) ? category : undefined,
  });

  return NextResponse.json(row, { status: 201 });
}
