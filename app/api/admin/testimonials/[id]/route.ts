import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/db/queries/testimonials";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/originals");
  revalidatePath("/prints/archive");
  revalidatePath("/artists");
  revalidatePath("/admin/testimonials");
}

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
    const existing = await getTestimonialById(numId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await req.json();

    if (data.rating !== undefined) {
      const r = Number(data.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5." },
          { status: 400 },
        );
      }
    }

    const updated = await updateTestimonial(numId, {
      ...(data.quote !== undefined && { quote: data.quote.trim() }),
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.location !== undefined && {
        location: data.location?.trim() || null,
      }),
      ...(data.rating !== undefined && {
        rating: Math.round(Number(data.rating)),
      }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.imagePublicId !== undefined && {
        imagePublicId: data.imagePublicId || null,
      }),
      ...(data.displayOrder !== undefined && {
        displayOrder: Number(data.displayOrder),
      }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    });

    revalidateAll();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update testimonial error:", err);
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
    await deleteTestimonial(numId);
    revalidateAll();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete testimonial error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
