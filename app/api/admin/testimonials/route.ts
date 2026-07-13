import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import {
  getAllTestimonialsForAdmin,
  createTestimonial,
} from "@/lib/db/queries/testimonials";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await getAllTestimonialsForAdmin());
  } catch (err) {
    console.error("List testimonials error:", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

/** Testimonials appear on the home, originals, archive and artists pages. */
function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/originals");
  revalidatePath("/prints/archive");
  revalidatePath("/artists");
  revalidatePath("/admin/testimonials");
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.quote?.trim() || !data.name?.trim()) {
      return NextResponse.json(
        { error: "Quote and name are required" },
        { status: 400 },
      );
    }

    const rating = Math.round(Number(data.rating ?? 5));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }

    const created = await createTestimonial({
      quote: data.quote.trim(),
      name: data.name.trim(),
      location: data.location?.trim() || null,
      rating,
      imageUrl: data.imageUrl || null,
      imagePublicId: data.imagePublicId || null,
      displayOrder: Number(data.displayOrder) || 0,
      isVisible: data.isVisible ?? true,
    });

    revalidateAll();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Create testimonial error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
