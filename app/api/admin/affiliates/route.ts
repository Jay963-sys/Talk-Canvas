import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { getAllAffiliates, createAffiliate } from "@/lib/db/queries/affiliates";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await getAllAffiliates());
  } catch (err) {
    console.error("List affiliates error:", err);
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

    if (!data.code?.trim() || !data.name?.trim()) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 },
      );
    }

    const pct = Number(data.discountPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      return NextResponse.json(
        { error: "Discount must be between 0 and 100." },
        { status: 400 },
      );
    }

    const created = await createAffiliate({
      code: data.code,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
      discountPercent: Math.round(pct),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    });

    revalidatePath("/admin/affiliates");
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "That code is already taken" },
        { status: 409 },
      );
    }
    console.error("Create affiliate error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
