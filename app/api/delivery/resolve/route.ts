import { NextResponse } from "next/server";
import { isPlaceId, resolveDeliveryPlace } from "@/lib/delivery/resolvePlace";

// Checkout preview: address details + driving km for a chosen place.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!isPlaceId(body.placeId)) {
    return NextResponse.json(
      { error: "Pick an address from the list" },
      { status: 400 },
    );
  }
  const sessionToken =
    typeof body.sessionToken === "string"
      ? body.sessionToken.slice(0, 64)
      : undefined;

  return NextResponse.json(
    await resolveDeliveryPlace(body.placeId, sessionToken),
  );
}
