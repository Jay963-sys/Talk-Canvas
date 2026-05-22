import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { createOriginal } from "@/lib/db/queries/originals";

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Updated validation matching new Drizzle schema
    const required = [
      "slug",
      "title",
      "artist",
      "year",
      "medium",
      "widthInches",
      "heightInches",
      "price",
      "imageUrl",
      "description",
      "frameStyle",
      "frameColor",
    ];

    for (const field of required) {
      // Use a stricter check so 0 (valid price) doesn't fail, but null/undefined/empty string does
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 },
        );
      }
    }

    const created = await createOriginal({
      slug: data.slug,
      title: data.title,
      artist: data.artist,
      year: Number(data.year),
      medium: data.medium,
      widthInches: Number(data.widthInches),
      heightInches: Number(data.heightInches),
      price: Number(data.price),
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      description: data.description,

      // New Frame Fields
      frameStyle: data.frameStyle,
      frameShape: data.frameShape, // Can be null
      frameColor: data.frameColor,
      glass: Boolean(data.glass),

      // Status Fields
      soldAt: data.soldAt ? new Date(data.soldAt) : null,
      displayOrder: Number(data.displayOrder) || 0,
      isVisible: data.isVisible ?? true,
    });

    revalidatePath("/originals");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "That slug is already taken" },
        { status: 409 },
      );
    }
    console.error("Create original error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
