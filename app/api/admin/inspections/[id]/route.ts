import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { updateInspectionRequest } from "@/lib/db/queries/inspections";
import { INSPECTION_STATUSES, type InspectionStatus } from "@/lib/inspections";

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
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const update: { status?: InspectionStatus; adminNotes?: string | null } = {};
  if (body?.status !== undefined) {
    if (!INSPECTION_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body?.adminNotes !== undefined) {
    update.adminNotes =
      typeof body.adminNotes === "string" && body.adminNotes.trim()
        ? body.adminNotes.trim().slice(0, 2000)
        : null;
  }

  const row = await updateInspectionRequest(numId, update);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/admin/inspections");
  return NextResponse.json(row);
}
