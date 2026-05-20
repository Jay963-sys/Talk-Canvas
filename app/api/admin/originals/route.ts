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

    // Basic validation
    const required = [
      "slug",
      "title",
      "artist",
      "year",
      "medium",
      "size",
      "price",
      "imageUrl",
      "description",
    ];
    for (const field of required) {
      if (!data[field]) {
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
      size: data.size,
      price: data.price,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      description: data.description,
      displayOrder: data.displayOrder ?? 0,
      isVisible: data.isVisible ?? true,
    });

    revalidatePath("/originals");
    revalidatePath("/");

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
