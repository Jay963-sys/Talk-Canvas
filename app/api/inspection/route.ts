import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { createInspectionRequest } from "@/lib/db/queries/inspections";
import InspectionRequestNotification from "@/lib/email/templates/InspectionRequestNotification";

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t === "" ? null : t;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // Honeypot: real people never fill the hidden "company" field.
    if (body && typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body?.name, 255);
    const phone = clean(body?.phone, 50);
    const address = clean(body?.address, 1000);
    const email = clean(body?.email, 255);
    const area = clean(body?.area, 100);
    const message = clean(body?.message, 2000);
    const rawDate = clean(body?.preferredDate, 20);
    const preferredDate =
      rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: "Please give your name, phone number and address." },
        { status: 400 },
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "That email address doesn't look right." },
        { status: 400 },
      );
    }

    await createInspectionRequest({
      name,
      phone,
      email,
      address,
      area,
      preferredDate,
      message,
    });

    const galleryEmail = process.env.GALLERY_EMAIL;
    if (galleryEmail) {
      try {
        await sendEmail({
          to: galleryEmail,
          subject: `Inspection request from ${name}`,
          react: InspectionRequestNotification({
            name,
            phone,
            email,
            address,
            area,
            preferredDate,
            message,
          }),
          ...(email ? { replyTo: email } : {}),
        });
      } catch (err) {
        // The request is saved in admin either way.
        console.error("Inspection email failed:", err);
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Inspection request error:", err);
    return NextResponse.json(
      { error: "Could not send your request. Please try again." },
      { status: 500 },
    );
  }
}
