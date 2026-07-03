import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getAllArtistsForAdmin, createArtist } from "@/lib/db/queries/artists";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const artists = await getAllArtistsForAdmin();
    return NextResponse.json(artists);
  } catch (err) {
    console.error("List artists error:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const required = ["name", "slug"];
    for (const field of required) {
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

    const created = await createArtist({
      name: data.name,
      slug: data.slug,
      bio: data.bio || null,
      portraitUrl: data.portraitUrl || null,
      portraitPublicId: data.portraitPublicId || null,
      location: data.location || null,
      instagram: data.instagram || null,
      website: data.website || null,
      featured: Boolean(data.featured),
      displayOrder: Number(data.displayOrder) || 0,
      isVisible: data.isVisible ?? true,
    });

    revalidatePath("/artists");
    revalidatePath("/admin/artists");

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "That slug is already taken" },
        { status: 409 },
      );
    }
    console.error("Create artist error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
