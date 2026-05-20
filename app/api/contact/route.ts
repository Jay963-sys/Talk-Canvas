import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import ContactMessage from "@/lib/email/templates/ContactMessage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const galleryEmail = process.env.GALLERY_EMAIL;
    if (galleryEmail) {
      try {
        await sendEmail({
          to: galleryEmail,
          subject: `Contact message from ${name}`,
          react: ContactMessage({
            name,
            email,
            phone: phone || null,
            message,
          }),
          replyTo: email,
        });
      } catch (err) {
        console.error("Contact email failed:", err);
        // continue — at least the request returns OK
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
