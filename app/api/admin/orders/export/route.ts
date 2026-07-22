import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getOrdersFiltered } from "@/lib/db/queries/orders";

export const dynamic = "force-dynamic";

// Same inclusive day-bounds as the orders table. Server clock (UTC on Vercel);
// Lagos is UTC+1, so a just-after-midnight order can fall in the previous day
// at the very boundary — acceptable for internal reporting.
function parseRange(from: string | null, to: string | null) {
  const f = from ? new Date(`${from}T00:00:00`) : undefined;
  const t = to ? new Date(`${to}T23:59:59.999`) : undefined;
  return {
    from: f && !Number.isNaN(+f) ? f : undefined,
    to: t && !Number.isNaN(+t) ? t : undefined,
  };
}

/** Quote every cell and neutralise spreadsheet formula injection. */
function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  // Sortable, unambiguous: "2026-07-22 15:15"
  return date.toISOString().slice(0, 16).replace("T", " ");
}

const COLUMNS = [
  "Date",
  "Order #",
  "Customer name",
  "Email",
  "Phone",
  "Payment status",
  "Amount",
  "Transaction reference",
  "Order status",
];

export async function GET(req: NextRequest) {
  // Exposes customer contact details + sales — admin only.
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const range = parseRange(searchParams.get("from"), searchParams.get("to"));
  const orders = await getOrdersFiltered(range);

  const rows = orders.map((o) =>
    [
      fmtDate(o.createdAt),
      `#${String(o.id).padStart(5, "0")}`,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.paymentStatus,
      o.total, // raw NGN integer, so the sheet can sum it
      o.paymentReference ?? "",
      o.status,
    ]
      .map(cell)
      .join(","),
  );

  // Leading BOM so Excel reads UTF-8 (accents in names) correctly.
  const csv = `\uFEFF${[COLUMNS.map(cell).join(","), ...rows].join("\r\n")}`;

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="talk-canvas-orders-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
