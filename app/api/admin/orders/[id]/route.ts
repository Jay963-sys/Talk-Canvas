import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { updateOrderStatus } from "@/lib/db/queries/orders"; // DB functions stay here
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants"; // Constants come from here

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
    const body = await req.json();

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = await updateOrderStatus(
        numId,
        body.status as OrderStatus,
      );
      if (!updated) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${numId}`);

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
