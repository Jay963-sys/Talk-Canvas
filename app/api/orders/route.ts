import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/db/queries/orders";
import { getOriginalsByIds } from "@/lib/db/queries/originals";
import { getArchiveSet } from "@/lib/db/queries/archivePrints";
import { getFrame } from "@/data/frames";
import { getSize, formatInches, type Orientation } from "@/data/sizes";
import { getPrice } from "@/data/pricing";
import { paystackEnabled, initializeTransaction } from "@/lib/paystack";
import { fulfillOrder } from "@/lib/orders/fulfillment";
import { checkCode } from "@/lib/db/queries/affiliates";
import type { Original, ArchivePrint, NewOrderItem } from "@/lib/db/schema";
import { SHIPPING_CONFIG } from "@/data/shipping";
import { quoteDelivery, type DeliverablePiece } from "@/lib/deliveryCalc";
import { OUTSIDE_LAGOS_ID } from "@/data/delivery";

/** Mirror of the cart's ceiling. Never trust the client's number. */
const MAX_QUANTITY = 99;

function clampQuantity(n: unknown): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_QUANTITY);
}

interface PrintItemInput {
  type?: "print";
  imageUrl: string;
  imagePublicId?: string;
  frameId: string;
  frameName: string;
  glass?: boolean;
  sizeId: string;
  sizeLabel: string;
  orientation?: Orientation;
  price: number;
  quantity?: number;
  /**
   * Present when this line is a set. Only the id is read — the panels, their
   * images and their count all come from the database, exactly like originals.
   * A client that could name its own panels could name a cheap set and receive
   * an expensive one.
   */
  setId?: number;
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
  quantity?: number;
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
  affiliateCode?: string;
  /** Lagos LGA id, or "outside-lagos". Required when deliveryMethod is "delivery". */
  deliveryZone?: string;
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
        // Only one-of-one works can sell out; recreatable house designs never do.
        if (dbOrig.oneOfOne && dbOrig.soldAt) {
          return NextResponse.json(
            {
              error: `"${dbOrig.title}" has just been sold. Please remove it from your cart and try again.`,
            },
            { status: 409 },
          );
        }
      }
    }

    // ── Validate sets against the DB ───────────────────────────────
    // A set is all-or-nothing, so it's resolved from the database before
    // anything is priced: the panels, their order and their number are facts
    // about the archive, not something the basket gets to assert.
    const setIds = [
      ...new Set(
        items
          .filter((i): i is PrintItemInput => i.type !== "original")
          .map((i) => i.setId)
          .filter((id): id is number => typeof id === "number"),
      ),
    ];
    const setsMap = new Map<number, ArchivePrint[]>();
    for (const setId of setIds) {
      const pieces = await getArchiveSet(setId);
      if (pieces.length < 2 || pieces.some((p) => !p.isVisible)) {
        return NextResponse.json(
          {
            error:
              "One of the sets in your cart is no longer available. Please remove it and try again.",
          },
          { status: 409 },
        );
      }
      setsMap.set(setId, pieces);
    }

    // Build item rows with server-trusted prices AND quantities
    const itemRows: Omit<NewOrderItem, "id" | "orderId">[] = [];
    // Discounts apply to prints + recreatable Talk Canvas designs only —
    // never to one-of-one artist works. Tracked as we go, from DB truth.
    let discountableSubtotal = 0;

    for (const item of items) {
      if (item.type === "original") {
        const dbOrig = originalsMap.get(item.originalId)!;
        // A one-of-one piece can only ever be bought once, whatever the client sends.
        const quantity = dbOrig.oneOfOne ? 1 : clampQuantity(item.quantity);
        if (!dbOrig.oneOfOne) {
          discountableSubtotal += dbOrig.price * quantity;
        }
        itemRows.push({
          type: "original",
          imageUrl: dbOrig.imageUrl,
          imagePublicId: dbOrig.imagePublicId ?? null,
          price: dbOrig.price,
          quantity,
          frameName: item.frameName,
          glass: item.glass ?? dbOrig.glass,
          sizeLabel: item.sizeLabel,
          frameId: null,
          sizeId: null,
          originalId: dbOrig.id,
          title: dbOrig.title,
          artist: dbOrig.artist,
          year: dbOrig.year,
          setId: null,
          setPosition: null,
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
      // Antique frames don't take glass; only box frames offer it.
      const effectiveGlass =
        frame.style === "antique"
          ? false
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

      const printQuantity = clampQuantity(item.quantity);
      const setPieces =
        typeof item.setId === "number" ? setsMap.get(item.setId)! : null;

      // Sizes are stored portrait; a landscape design rotates them. Trust the
      // orientation flag but never the client's label — derive it ourselves,
      // or the gallery frames a landscape print as a portrait one. For a set
      // the orientation comes off the panels, which are guaranteed to agree.
      const orientation: Orientation = setPieces
        ? setPieces[0].orientation === "landscape"
          ? "landscape"
          : "portrait"
        : item.orientation === "landscape"
          ? "landscape"
          : "portrait";

      if (setPieces) {
        // One cart line becomes one row PER PANEL. The gallery prints and
        // frames each panel individually, so a single row saying "triptych"
        // would leave staff guessing at the picking list. `price` stays the
        // unit price — the set costs N frames, which is what N rows expresses.
        for (const piece of setPieces) {
          itemRows.push({
            type: "print",
            imageUrl: piece.imageUrl,
            imagePublicId: piece.imagePublicId,
            price,
            quantity: printQuantity,
            frameName: item.frameName,
            glass: effectiveGlass,
            sizeLabel: formatInches(size, orientation),
            frameId: item.frameId,
            sizeId: item.sizeId,
            originalId: null,
            title: null,
            artist: null,
            year: null,
            setId: item.setId!,
            setPosition: piece.setPosition,
          });
        }
        discountableSubtotal += price * printQuantity * setPieces.length;
        continue;
      }

      discountableSubtotal += price * printQuantity;
      itemRows.push({
        type: "print",
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId ?? null,
        price,
        quantity: printQuantity,
        frameName: item.frameName,
        glass: effectiveGlass,
        sizeLabel: formatInches(size, orientation),
        frameId: item.frameId,
        sizeId: item.sizeId,
        originalId: null,
        title: null,
        artist: null,
        year: null,
        setId: null,
        setPosition: null,
      });
    }

    // Quantity-aware subtotal, computed server-side from trusted values.
    // Sets need no special case here: they're already N rows of unit price.
    const computedSubtotal = itemRows.reduce(
      (sum, i) => sum + i.price * (i.quantity ?? 1),
      0,
    );

    // ── Affiliate discount ─────────────────────────────────────────
    // The client sends a CODE, never a price or a discount. The server decides
    // what it's worth, and only against the discountable portion of the cart.
    let affiliateId: number | null = null;
    let affiliateCode: string | null = null;
    let discountPercent: number | null = null;
    let discountAmount = 0;

    if (typeof body.affiliateCode === "string" && body.affiliateCode.trim()) {
      const result = await checkCode(body.affiliateCode, customer.email);
      if (!result.ok) {
        const messages: Record<string, string> = {
          not_found: "That code isn't valid.",
          inactive: "That code is no longer active.",
          expired: "That code has expired.",
          already_used: "You've already used that code.",
        };
        return NextResponse.json(
          { error: messages[result.reason] ?? "That code isn't valid." },
          { status: 400 },
        );
      }

      const affiliate = result.affiliate;
      affiliateId = affiliate.id;
      affiliateCode = affiliate.code;
      discountPercent = affiliate.discountPercent;

      // Round down — never hand out a fractional naira in the customer's favour.
      discountAmount = Math.floor(
        (discountableSubtotal * affiliate.discountPercent) / 100,
      );
      // Belt and braces: a discount can never exceed what's discountable.
      discountAmount = Math.max(
        0,
        Math.min(discountAmount, discountableSubtotal),
      );
    }

    // ── Delivery ───────────────────────────────────────────────────
    // Recomputed from the DB-trusted items and the chosen zone. The client
    // sends a zone id, never a fee.
    let computedShipping = 0;
    let deliveryVehicle: string | null = null;
    let deliveryQuotePending = false;

    if (deliveryMethod === "delivery") {
      if (!body.deliveryZone) {
        return NextResponse.json(
          { error: "Please choose your delivery area." },
          { status: 400 },
        );
      }

      const pieces: DeliverablePiece[] = itemRows.map((i) => ({
        sizeId: i.sizeId ?? null,
        widthInches:
          i.originalId != null
            ? (originalsMap.get(i.originalId)?.widthInches ?? null)
            : null,
        heightInches:
          i.originalId != null
            ? (originalsMap.get(i.originalId)?.heightInches ?? null)
            : null,
        quantity: i.quantity ?? 1,
        // Panels are already one row each by this point, so setSize stays 1 —
        // only the quote flag is needed here.
        isSet: i.setId != null,
      }));

      const quote = quoteDelivery(body.deliveryZone, pieces);
      if (!quote) {
        return NextResponse.json(
          { error: "We don't recognise that delivery area." },
          { status: 400 },
        );
      }

      computedShipping = quote.fee;
      deliveryVehicle = quote.vehicle;
      deliveryQuotePending = quote.quoteOnRequest;
    }

    const computedTotal = computedSubtotal - discountAmount + computedShipping;

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
        deliveryZone: deliveryMethod === "delivery" ? body.deliveryZone! : null,
        deliveryVehicle,
        deliveryQuotePending,
        affiliateId,
        affiliateCode,
        discountPercent,
        discountAmount,
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
