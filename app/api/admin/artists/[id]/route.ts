import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import {
  getArtistById,
  updateArtist,
  deleteArtist,
} from "@/lib/db/queries/artists";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await getArtistById(numId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await req.json();
    const updated = await updateArtist(numId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.portraitUrl !== undefined && {
        portraitUrl: data.portraitUrl || null,
      }),
      ...(data.portraitPublicId !== undefined && {
        portraitPublicId: data.portraitPublicId || null,
      }),
      ...(data.location !== undefined && { location: data.location || null }),
      ...(data.instagram !== undefined && {
        instagram: data.instagram || null,
      }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
      ...(data.displayOrder !== undefined && {
        displayOrder: Number(data.displayOrder),
      }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    });

    revalidatePath("/artists");
    revalidatePath(`/artists/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/artists/${data.slug}`);
    }
    revalidatePath("/admin/artists");
    revalidatePath(`/admin/artists/${numId}`);

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "That slug is already taken" },
        { status: 409 },
      );
    }
    console.error("Update artist error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!numId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const existing = await getArtistById(numId);
    if (existing) {
      // originals.artistId is onDelete "set null" — their works survive and
      // fall back to the `artist` text byline.
      await deleteArtist(numId);
      revalidatePath("/artists");
      revalidatePath(`/artists/${existing.slug}`);
      revalidatePath("/admin/artists");
      revalidatePath("/originals");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete artist error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
