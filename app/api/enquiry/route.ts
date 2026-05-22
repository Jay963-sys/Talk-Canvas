import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import EnquiryNotification from "@/lib/email/templates/EnquiryNotification";
import { getOriginalBySlug } from "@/lib/db/queries/originals";
import { formatNaira } from "@/lib/store"; // ← Don't forget to import this!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workId, workTitle, name, email, phone, message } = body;

    if (!name || !email || !workId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Look up the work for richer email content
    const work = await getOriginalBySlug(workId);
    const artist = work?.artist || "Unknown";

    // Format the integer price into Naira, or fallback to an em dash
    const priceDisplay = work?.price ? formatNaira(Number(work.price)) : "—";

    const galleryEmail = process.env.GALLERY_EMAIL;
    if (galleryEmail) {
      try {
        await sendEmail({
          to: galleryEmail,
          subject: `Enquiry: ${workTitle} — ${name}`,
          react: EnquiryNotification({
            workTitle,
            workArtist: artist,
            workPrice: priceDisplay, // ← Passes the formatted string to the email
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            message,
          }),
          replyTo: email,
        });
      } catch (err) {
        console.error("Enquiry email failed:", err);
        // continue — at least the request returns OK
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
