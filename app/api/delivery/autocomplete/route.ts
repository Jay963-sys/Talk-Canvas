import { NextResponse } from "next/server";
import { autocompleteAddress } from "@/lib/delivery/resolvePlace";

// Address suggestions for checkout. Provider (Geoapify or Google) is chosen
// in lib/delivery/resolvePlace.ts; the key stays server-side either way.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input =
    typeof body.input === "string" ? body.input.trim().slice(0, 200) : "";
  const sessionToken =
    typeof body.sessionToken === "string"
      ? body.sessionToken.slice(0, 64)
      : undefined;
  if (input.length < 3) return NextResponse.json({ suggestions: [] });

  try {
    return NextResponse.json({
      suggestions: await autocompleteAddress(input, sessionToken),
    });
  } catch (e) {
    console.error("Address autocomplete failed", e);
    return NextResponse.json(
      { error: "Address search is unavailable right now" },
      { status: 502 },
    );
  }
}
