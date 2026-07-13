import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import {
  getAffiliateById,
  updateAffiliate,
  deleteAffiliate,
} from "@/lib/db/queries/affiliates";

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
    const existing = await getAffiliateById(numId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await req.json();

    if (data.discountPercent !== undefined) {
      const pct = Number(data.discountPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return NextResponse.json(
          { error: "Discount must be between 0 and 100." },
          { status: 400 },
        );
      }
    }

    const updated = await updateAffiliate(numId, {
      ...(data.kind !== undefined && {
        kind: data.kind === "promo" ? "promo" : "affiliate",
      }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.discountPercent !== undefined && {
        discountPercent: Math.round(Number(data.discountPercent)),
      }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });

    revalidatePath("/admin/affiliates");
    revalidatePath(`/admin/affiliates/${numId}`);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "That code is already taken" },
        { status: 409 },
      );
    }
    console.error("Update affiliate error:", err);
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
    // orders.affiliateId is onDelete "set null" — past orders keep their
    // code + discount snapshot, so reconciliation history survives.
    await deleteAffiliate(numId);
    revalidatePath("/admin/affiliates");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete affiliate error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
