import { NextResponse } from "next/server";
import { isPlaceId, resolveDeliveryPlace } from "@/lib/delivery/resolvePlace";

// Used by /delivery-demo only.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!isPlaceId(body.placeId)) {
    return NextResponse.json(
      { error: "Pick an address from the list" },
      { status: 400 },
    );
  }
  const place = await resolveDeliveryPlace(body.placeId);
  if (place.km === null) {
    return NextResponse.json(
      { error: "No driving route found to that address" },
      { status: 502 },
    );
  }
  return NextResponse.json({ km: place.km, minutes: place.minutes });
}
