import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/db/queries/orders";
import { getOriginalsByIds } from "@/lib/db/queries/originals";
import { getFrame } from "@/data/frames";
import { getSize, formatInches } from "@/data/sizes";
import { getPrice } from "@/data/pricing";
import { paystackEnabled, initializeTransaction } from "@/lib/paystack";
import { fulfillOrder } from "@/lib/orders/fulfillment";
import type { Original, NewOrderItem } from "@/lib/db/schema";
import { SHIPPING_CONFIG } from "@/data/shipping";

interface PrintItemInput {
  type?: "print";
  imageUrl: string;
  imagePublicId?: string;
  frameId: string;
  frameName: string;
  glass?: boolean;
  sizeId: string;
  sizeLabel: string;
  price: number;
}
interface OriginalItemInput {
  type: "original";
  originalId: number;
  imageUrl: string;
  imagePublicId?: string;
  frameName: string;
  glass?: boolean;
  sizeLabel: string;
  title: string;
  artist: string;
  year: number;
  price: number;
}
type OrderItemInput = PrintItemInput | OriginalItemInput;

interface OrderBody {
  customer: { name: string; email: string; phone: string };
  deliveryMethod: "delivery" | "pickup";
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  } | null;
  items: OrderItemInput[];
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderBody;
    const { customer, deliveryMethod, address, items } = body;
    const notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : null;

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Missing customer info" },
        { status: 400 },
      );
    }
    if (!["pickup", "delivery"].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: "Invalid delivery method" },
        { status: 400 },
      );
    }
    if (
      deliveryMethod === "delivery" &&
      (!address?.addressLine1 ||
        !address?.city ||
        !address?.state ||
        !address?.country)
    ) {
      return NextResponse.json(
        { error: "Missing shipping address" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Validate originals against the DB
    const originalItems = items.filter(
      (i): i is OriginalItemInput => i.type === "original",
    );
    const originalIds = originalItems.map((i) => i.originalId);
    const originalsMap = new Map<number, Original>();
    if (originalIds.length > 0) {
      const dbOriginals = await getOriginalsByIds(originalIds);
      for (const o of dbOriginals) originalsMap.set(o.id, o);
      for (const item of originalItems) {
        const dbOrig = originalsMap.get(item.originalId);
        if (!dbOrig) {
          return NextResponse.json(
            { error: "One of the original works is no longer available." },
            { status: 409 },
          );
        }
        if (dbOrig.soldAt) {
          return NextResponse.json(
            {
              error: `"${dbOrig.title}" has just been sold. Please remove it from your cart and try again.`,
            },
            { status: 409 },
          );
        }
      }
    }

    // Build item rows with server-trusted prices
    const itemRows: Omit<NewOrderItem, "id" | "orderId">[] = [];
    for (const item of items) {
      if (item.type === "original") {
        const dbOrig = originalsMap.get(item.originalId)!;
        itemRows.push({
          type: "original",
          imageUrl: dbOrig.imageUrl,
          imagePublicId: dbOrig.imagePublicId ?? null,
          price: dbOrig.price,
          frameName: item.frameName,
          glass: item.glass ?? dbOrig.glass,
          sizeLabel: item.sizeLabel,
          frameId: null,
          sizeId: null,
          originalId: dbOrig.id,
          title: dbOrig.title,
          artist: dbOrig.artist,
          year: dbOrig.year,
        });
        continue;
      }
      const frame = getFrame(item.frameId);
      const size = getSize(item.sizeId);
      if (!frame || !size) {
        return NextResponse.json(
          { error: "Invalid print configuration in your cart." },
          { status: 400 },
        );
      }
      const effectiveGlass =
        frame.style === "antique"
          ? true
          : frame.shape === "box"
            ? (item.glass ?? false)
            : false;
      const price = getPrice(frame, effectiveGlass, size);
      if (price === null) {
        return NextResponse.json(
          { error: "That size isn't available for the selected frame." },
          { status: 400 },
        );
      }
      itemRows.push({
        type: "print",
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId ?? null,
        price,
        frameName: item.frameName,
        glass: effectiveGlass,
        sizeLabel: formatInches(size),
        frameId: item.frameId,
        sizeId: item.sizeId,
        originalId: null,
        title: null,
        artist: null,
        year: null,
      });
    }

    const computedSubtotal = itemRows.reduce((sum, i) => sum + i.price, 0);
    const computedShipping =
      deliveryMethod === "pickup" ? 0 : SHIPPING_CONFIG.delivery.fee;
    const computedTotal = computedSubtotal + computedShipping;

    const paymentReference = paystackEnabled()
      ? `tcg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
      : null;

    const order = await createOrder(
      {
        customerName: customer.name,
        customerEmail: customer.email.toLowerCase(),
        customerPhone: customer.phone,
        deliveryMethod,
        addressLine1:
          deliveryMethod === "delivery" ? address!.addressLine1 : null,
        addressLine2:
          deliveryMethod === "delivery"
            ? (address!.addressLine2 ?? null)
            : null,
        city: deliveryMethod === "delivery" ? address!.city : null,
        state: deliveryMethod === "delivery" ? address!.state : null,
        postalCode:
          deliveryMethod === "delivery" ? (address!.postalCode ?? null) : null,
        country: deliveryMethod === "delivery" ? address!.country : null,
        subtotal: computedSubtotal,
        shipping: computedShipping,
        total: computedTotal,
        notes,
        status: "pending",
        paymentReference,
      },
      itemRows,
    );

    // ── Payment mode vs immediate fulfillment ──────────────────────
    if (paystackEnabled()) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      try {
        const init = await initializeTransaction({
          email: order.customerEmail,
          amountKobo: order.total * 100,
          reference: order.paymentReference!,
          callbackUrl: `${siteUrl}/api/paystack/verify`,
          metadata: { orderId: order.id },
        });
        return NextResponse.json(
          { authorizationUrl: init.authorization_url },
          { status: 201 },
        );
      } catch (err) {
        console.error("Paystack init failed:", err);
        return NextResponse.json(
          { error: "Could not start payment. Please try again." },
          { status: 502 },
        );
      }
    }

    // No gateway configured — fulfill immediately (current behavior)
    await fulfillOrder(order);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
