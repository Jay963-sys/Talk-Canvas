import { NextRequest, NextResponse } from "next/server";

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

    // TODO step 10: send email via Resend
    console.log("New enquiry:", {
      workId,
      workTitle,
      name,
      email,
      phone,
      message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
