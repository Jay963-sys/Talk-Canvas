import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db/queries/orders";
import {
  getOriginalsByIds,
  markOriginalSold,
} from "@/lib/db/queries/originals";
import { sendEmail } from "@/lib/email";
import OrderConfirmation from "@/lib/email/templates/OrderConfirmation";
import OrderNotification from "@/lib/email/templates/OrderNotification";
import { SHIPPING_CONFIG } from "@/data/shipping";
import type { Original, NewOrderItem } from "@/lib/db/schema";
import { getFrame } from "@/data/frames";
import { getSize, formatInches } from "@/data/sizes";
import { getPrice } from "@/data/pricing";

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
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderBody;
    const { customer, deliveryMethod, address, items } = body;
    const notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : null;

    // Basic validation
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

    // ── Validate originals against the DB ──────────────────────────
    // One-of-one works: never trust client price or availability.
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

    // ── Build item rows with server-trusted prices ─────────────────
    // ── Build item rows with server-trusted prices ─────────────────
    // Prices for BOTH types come from the server, never the client.
    const itemRows: Omit<NewOrderItem, "id" | "orderId">[] = [];

    for (const item of items) {
      if (item.type === "original") {
        const dbOrig = originalsMap.get(item.originalId)!;
        itemRows.push({
          type: "original",
          imageUrl: dbOrig.imageUrl,
          imagePublicId: dbOrig.imagePublicId ?? null,
          price: dbOrig.price, // DB price, not client
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

      // print — recompute from the pricing tables (the same source the
      // configurator uses), so a tampered client price is overwritten and
      // legitimate orders still match exactly.
      const frame = getFrame(item.frameId);
      const size = getSize(item.sizeId);
      if (!frame || !size) {
        return NextResponse.json(
          { error: "Invalid print configuration in your cart." },
          { status: 400 },
        );
      }

      // Glass is dictated by the frame, not the client:
      // antique always includes glass, box is optional, floating never has it.
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
        price, // server-computed — client price ignored
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
    // Shipping is server-authoritative — derived from delivery method, never the client
    const computedShipping =
      deliveryMethod === "pickup" ? 0 : SHIPPING_CONFIG.delivery.fee;
    const computedTotal = computedSubtotal + computedShipping;

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
      },
      itemRows,
    );

    // Mark originals sold so they drop off listings immediately.
    // TODO: move to Paystack webhook once payment is live, so only PAID
    // orders remove inventory.
    if (originalIds.length > 0) {
      await Promise.allSettled(originalIds.map((id) => markOriginalSold(id)));
    }

    // ── Emails (best effort) ───────────────────────────────────────
    const orderNumber = String(order.id).padStart(5, "0");
    const shippingAddressForEmail =
      order.deliveryMethod === "delivery" && order.addressLine1
        ? {
            line1: order.addressLine1,
            line2: order.addressLine2,
            city: order.city!,
            state: order.state!,
            country: order.country!,
          }
        : undefined;

    const emailItems = order.items.map((i) => ({
      type: (i.type as "print" | "original") ?? "print",
      imageUrl: i.imageUrl,
      frameName: i.frameName,
      glass: i.glass,
      sizeLabel: i.sizeLabel,
      price: i.price,
      title: i.title,
      artist: i.artist,
      year: i.year,
    }));

    const galleryEmail = process.env.GALLERY_EMAIL;

    const emailJobs: Promise<unknown>[] = [
      sendEmail({
        to: customer.email,
        subject: `Your Talk Canvas Gallery order #${orderNumber}`,
        react: OrderConfirmation({
          orderNumber,
          customerName: order.customerName,
          items: emailItems,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          deliveryMethod: order.deliveryMethod as "pickup" | "delivery",
          pickupAddress: SHIPPING_CONFIG.pickup.address,
          pickupDays: SHIPPING_CONFIG.pickup.days,
          pickupHours: SHIPPING_CONFIG.pickup.hours,
          shippingAddress: shippingAddressForEmail,
          notes: order.notes,
        }),
        replyTo: galleryEmail,
      }),
    ];

    if (galleryEmail) {
      emailJobs.push(
        sendEmail({
          to: galleryEmail,
          subject: `New order #${orderNumber} — ${order.customerName}`,
          react: OrderNotification({
            orderNumber,
            customer: {
              name: order.customerName,
              email: order.customerEmail,
              phone: order.customerPhone,
            },
            items: emailItems,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            deliveryMethod: order.deliveryMethod as "pickup" | "delivery",
            shippingAddress: shippingAddressForEmail,
            notes: order.notes,
          }),
          replyTo: order.customerEmail,
        }),
      );
    }

    const results = await Promise.allSettled(emailJobs);
    results.forEach((r, idx) => {
      if (r.status === "rejected") {
        console.error(`Email ${idx} failed:`, r.reason);
      }
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
