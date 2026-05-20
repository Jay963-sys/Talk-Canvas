import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import CustomOrderNotification from "@/lib/email/templates/CustomOrderNotification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      width,
      height,
      unit,
      framePreference,
      message,
      imageUrl,
    } = body;

    if (!name || !email || !phone || !message) {
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
          subject: `Custom order request from ${name}`,
          react: CustomOrderNotification({
            name,
            email,
            phone,
            width: width || null,
            height: height || null,
            unit: unit || "inches",
            framePreference: framePreference || null,
            message,
            imageUrl: imageUrl || null,
          }),
          replyTo: email,
        });
      } catch (err) {
        console.error("Custom order email failed:", err);
        // continue — at least the request returns OK
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Custom order error:", err);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 },
    );
  }
}
