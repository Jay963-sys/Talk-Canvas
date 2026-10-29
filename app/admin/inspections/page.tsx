import { getAllInspectionRequests } from "@/lib/db/queries/inspections";
import InspectionStatusControl from "@/components/admin/InspectionStatusControl";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

function formatDay(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function AdminInspectionsPage() {
  const items = await getAllInspectionRequests();
  const open = items.filter((i) => i.status === "new").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="display text-3xl font-normal">Inspections</h1>
        <p className="text-sm text-ink-soft mt-1">
          {items.length} total · {open} new
        </p>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="text-sm text-ink-soft">
            No inspection requests yet. Customers book them at /inspection.
          </p>
        </div>
      ) : (
        <div className="border border-line divide-y divide-line bg-white">
          {items.map((r) => (
            <div key={r.id} className="p-5 grid md:grid-cols-[1fr_240px] gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-[15px] text-ink font-medium">{r.name}</p>
                  {r.status === "new" && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-widest">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mb-3">
                  Requested {formatDateTime(r.createdAt)}
                  {r.preferredDate && <> · prefers {formatDay(r.preferredDate)}</>}
                </p>
                <p className="text-sm">
                  <a href={`tel:${r.phone}`} className="hover:underline">
                    {r.phone}
                  </a>
                  {r.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${r.email}`} className="hover:underline break-all">
                        {r.email}
                      </a>
                    </>
                  )}
                </p>
                <p className="text-sm text-ink-soft mt-1 whitespace-pre-wrap">
                  {r.address}
                  {r.area && <> — {r.area}</>}
                </p>
                {r.message && (
                  <p className="text-sm text-ink mt-3 whitespace-pre-wrap border-l-2 border-line pl-3">
                    {r.message}
                  </p>
                )}
              </div>
              <InspectionStatusControl
                id={r.id}
                status={r.status}
                adminNotes={r.adminNotes}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
