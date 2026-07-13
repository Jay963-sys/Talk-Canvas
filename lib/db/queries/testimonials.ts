import { db } from "../index";
import { testimonials, type Testimonial, type NewTestimonial } from "../schema";
import { eq, asc, desc } from "drizzle-orm";

// ── PUBLIC ───────────────────────────────────────────────────────

/** Visible testimonials, ordered. Photo-bearing ones lead — they sell hardest. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isVisible, true))
    .orderBy(asc(testimonials.displayOrder), desc(testimonials.id));

  return rows;
}

// ── ADMIN ────────────────────────────────────────────────────────

export async function getAllTestimonialsForAdmin(): Promise<Testimonial[]> {
  return await db
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.displayOrder), desc(testimonials.id));
}

export async function getTestimonialById(
  id: number,
): Promise<Testimonial | undefined> {
  const [row] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  return row;
}

export async function createTestimonial(
  data: NewTestimonial,
): Promise<Testimonial> {
  const [created] = await db.insert(testimonials).values(data).returning();
  return created;
}

export async function updateTestimonial(
  id: number,
  data: Partial<NewTestimonial>,
): Promise<Testimonial | undefined> {
  const [updated] = await db
    .update(testimonials)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();
  return updated;
}

export async function deleteTestimonial(id: number): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
