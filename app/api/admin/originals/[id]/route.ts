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

      // Dimensions
      ...(data.widthInches !== undefined && {
        widthInches: Number(data.widthInches),
      }),
      ...(data.heightInches !== undefined && {
        heightInches: Number(data.heightInches),
      }),

      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.imagePublicId !== undefined && {
        imagePublicId: data.imagePublicId,
      }),
      ...(data.description !== undefined && { description: data.description }),

      // Frame Info
      ...(data.frameStyle !== undefined && { frameStyle: data.frameStyle }),
      ...(data.frameShape !== undefined && { frameShape: data.frameShape }),
      ...(data.frameColor !== undefined && { frameColor: data.frameColor }),
      ...(data.glass !== undefined && { glass: Boolean(data.glass) }),

      // Status
      ...(data.soldAt !== undefined && {
        soldAt: data.soldAt ? new Date(data.soldAt) : null,
      }),
      ...(data.displayOrder !== undefined && {
        displayOrder: Number(data.displayOrder),
      }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    });

    revalidatePath("/originals");
    revalidatePath(`/originals/${existing.slug}`);
    if (data.slug && data.slug !== existing.slug) {
      revalidatePath(`/originals/${data.slug}`);
    }
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/admin/originals/${numId}`);

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
      revalidatePath("/admin");
      revalidatePath(`/admin/originals/${numId}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete original error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
