/** Kept free of DB imports so client components can use it. */
export const INSPECTION_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "done",
  "cancelled",
] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  done: "Done",
  cancelled: "Cancelled",
};
