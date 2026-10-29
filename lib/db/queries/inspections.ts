import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  inspectionRequests,
  type InspectionRequest,
  type NewInspectionRequest,
} from "@/lib/db/schema";
import type { InspectionStatus } from "@/lib/inspections";

export async function createInspectionRequest(
  data: NewInspectionRequest,
): Promise<InspectionRequest> {
  const [row] = await db.insert(inspectionRequests).values(data).returning();
  return row;
}

export async function getAllInspectionRequests(): Promise<InspectionRequest[]> {
  return db
    .select()
    .from(inspectionRequests)
    .orderBy(desc(inspectionRequests.createdAt));
}

export async function updateInspectionRequest(
  id: number,
  data: { status?: InspectionStatus; adminNotes?: string | null },
): Promise<InspectionRequest | undefined> {
  const [row] = await db
    .update(inspectionRequests)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inspectionRequests.id, id))
    .returning();
  return row;
}
