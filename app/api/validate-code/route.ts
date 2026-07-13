import { NextRequest, NextResponse } from "next/server";
import { checkCode } from "@/lib/db/queries/affiliates";

export const dynamic = "force-dynamic";

/**
 * Preview a code at checkout. Returns the discount percent so the UI can show
 * "10% off applied" — but the authoritative discount is always recomputed when
 * the order is actually created. Nothing here is trusted downstream.
 */
export async function POST(req: NextRequest) {
  try {
    const { code, email } = (await req.json()) as {
      code?: string;
      email?: string;
    };

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Enter a code." }, { status: 400 });
    }

    const result = await checkCode(code, email);

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: "That code isn't valid.",
        inactive: "That code is no longer active.",
        expired: "That code has expired.",
        already_used: "You've already used that code.",
      };
      return NextResponse.json(
        {
          valid: false,
          error: messages[result.reason] ?? "That code isn't valid.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.affiliate.code,
      discountPercent: result.affiliate.discountPercent,
    });
  } catch (err) {
    console.error("Validate code error:", err);
    return NextResponse.json(
      { error: "Could not check that code." },
      { status: 500 },
    );
  }
}
