import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import {
  getOriginalById,
  updateOriginal,
  deleteOriginal,
} from "@/lib/db/queries/originals";

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
    const existing = await getOriginalById(numId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await req.json();
    const updated = await updateOriginal(numId, {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.artist !== undefined && { artist: data.artist }),
      ...(data.year !== undefined && { year: Number(data.year) }),
      ...(data.medium !== undefined && { medium: data.medium }),
      ...(data.size !== undefined && { size: data.size }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.imagePublicId !== undefined && {
        imagePublicId: data.imagePublicId,
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.displayOrder !== undefined && {
        displayOrder: data.displayOrder,
      }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    });

    revalidatePath("/originals");
    revalidatePath(`/originals/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/originals/${data.slug}`);
    }
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "That slug is already taken" },
        { status: 409 },
      );
    }
    console.error("Update original error:", err);
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
    const existing = await getOriginalById(numId);
    if (existing) {
      await deleteOriginal(numId);
      revalidatePath("/originals");
      revalidatePath(`/originals/${existing.slug}`);
      revalidatePath("/");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete original error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
