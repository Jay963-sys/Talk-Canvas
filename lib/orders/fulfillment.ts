import {
  markOriginalSold,
  getOriginalsByIds,
} from "@/lib/db/queries/originals";
import {
  getOrderByReference,
  markOrderPaidByReference,
  type OrderWithItems,
} from "@/lib/db/queries/orders";
import { sendEmail } from "@/lib/email";
import OrderConfirmation from "@/lib/email/templates/OrderConfirmation";
import OrderNotification from "@/lib/email/templates/OrderNotification";
import { SHIPPING_CONFIG } from "@/data/shipping";
import { getZone, OUTSIDE_LAGOS_ID } from "@/data/delivery";
import { VEHICLE_LABELS } from "@/lib/deliveryCalc";
import { sendPurchase } from "@/lib/meta/capi";

/** Split a stored full name into first / last for Meta's user_data. */
function splitName(full: string | null | undefined): {
  first: string;
  last: string;
} {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/** Runs exactly once per confirmed order: mark one-of-one originals sold + send emails. */
export async function fulfillOrder(order: OrderWithItems): Promise<void> {
  const originalIds = order.items
    .filter((i) => i.type === "original" && i.originalId != null)
    .map((i) => i.originalId as number);

  // originalId → oneOfOne. Used both to decide what to mark sold and to tag
  // the emails, so the gallery can tell a one-of-one from a repaint.
  const oneOfOneById = new Map<number, boolean>();

  if (originalIds.length > 0) {
    // Only one-of-one works (artist originals) are marked sold. Talk Canvas
    // Originals are recreatable house designs — repainted to order — so they
    // must stay available after purchase.
    const originals = await getOriginalsByIds(originalIds);
    for (const o of originals) oneOfOneById.set(o.id, o.oneOfOne);

    const soldIds = originals.filter((o) => o.oneOfOne).map((o) => o.id);

    if (soldIds.length > 0) {
      await Promise.allSettled(soldIds.map((id) => markOriginalSold(id)));
    }
  }

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
    quantity: i.quantity ?? 1,
    oneOfOne:
      i.type === "original" && i.originalId != null
        ? (oneOfOneById.get(i.originalId) ?? false)
        : false,
    title: i.title,
    artist: i.artist,
    year: i.year,
    // Set membership drives the grouping in both templates: the customer sees
    // one "Set of 3" line, the gallery sees every panel as a picking list.
    setId: i.setId ?? null,
    setPosition: i.setPosition ?? null,
  }));

  // Production times differ by piece type, so the customer email shouldn't
  // hardcode one figure. Derive a line that's true for THIS order.
  const hasPrint = emailItems.some((i) => i.type === "print");
  const hasRepaint = emailItems.some(
    (i) => i.type === "original" && !i.oneOfOne,
  );
  const hasOneOfOne = emailItems.some((i) => i.oneOfOne);

  const timelineParts: string[] = [];
  if (hasPrint) timelineParts.push("framed prints take 3–5 working days");
  if (hasRepaint)
    timelineParts.push("hand-painted repaints take 5–7 working days");
  if (hasOneOfOne)
    timelineParts.push(
      "original artist paintings ship within a week, as they're already complete",
    );

  const productionNote =
    timelineParts.length === 0
      ? "We'll be in touch as soon as your order is ready."
      : timelineParts.length === 1
        ? `Production: ${timelineParts[0]}.`
        : `Production times vary by piece: ${timelineParts.join("; ")}.`;

  // Delivery context for the emails. Two things ship at zero and must be quoted
  // by hand — an outside-Lagos address, and any order containing a set. Surface
  // it loudly either way or it gets shipped for free.
  const deliveryQuotePending = order.deliveryQuotePending ?? false;
  const deliveryZoneLabel =
    order.deliveryZone === OUTSIDE_LAGOS_ID
      ? "Outside Lagos"
      : (getZone(order.deliveryZone ?? "")?.label ?? null);
  const deliveryVehicleLabel = order.deliveryVehicle
    ? (VEHICLE_LABELS[order.deliveryVehicle as keyof typeof VEHICLE_LABELS] ??
      null)
    : null;

  const galleryEmail = process.env.GALLERY_EMAIL;

  const emailJobs: Promise<unknown>[] = [
    sendEmail({
      to: order.customerEmail,
      subject: `Your Talk Canvas Gallery order #${orderNumber}`,
      react: OrderConfirmation({
        orderNumber,
        customerName: order.customerName,
        items: emailItems,
        productionNote,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        affiliateCode: order.affiliateCode,
        discountPercent: order.discountPercent,
        shipping: order.shipping,
        total: order.total,
        deliveryMethod: order.deliveryMethod as "pickup" | "delivery",
        deliveryZoneLabel,
        deliveryQuotePending,
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
        subject: deliveryQuotePending
          ? `New order #${orderNumber} — ${order.customerName} — DELIVERY QUOTE NEEDED`
          : `New order #${orderNumber} — ${order.customerName}`,
        react: OrderNotification({
          orderNumber,
          customer: {
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone,
          },
          items: emailItems,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          affiliateCode: order.affiliateCode,
          discountPercent: order.discountPercent,
          shipping: order.shipping,
          total: order.total,
          deliveryMethod: order.deliveryMethod as "pickup" | "delivery",
          deliveryZoneLabel,
          deliveryVehicleLabel,
          deliveryQuotePending,
          shippingAddress: shippingAddressForEmail,
          notes: order.notes,
        }),
        replyTo: order.customerEmail,
      }),
    );
  }

  const results = await Promise.allSettled(emailJobs);
  results.forEach((r, idx) => {
    if (r.status === "rejected")
      console.error(`Email ${idx} failed:`, r.reason);
  });
}

/** Idempotent: verifies amount, flips to paid once, then fulfills. */
export async function fulfillPaidOrder(
  reference: string,
  paidAmountKobo: number,
): Promise<"fulfilled" | "skipped" | "amount_mismatch" | "not_found"> {
  const order = await getOrderByReference(reference);
  if (!order) return "not_found";

  if (paidAmountKobo !== order.total * 100) {
    console.error(
      `Amount mismatch for ${reference}: paid ${paidAmountKobo}, expected ${order.total * 100}`,
    );
    return "amount_mismatch";
  }

  const transitioned = await markOrderPaidByReference(reference);
  if (!transitioned) return "skipped"; // already paid

  await fulfillOrder(order);

  // Meta Conversions API — the authoritative, ad-block-proof Purchase.
  // Reached only when the order just transitioned to paid, so it fires exactly
  // once per order. `sendPurchase` swallows its own errors, so a Meta outage can
  // never break fulfilment. `eventId` MUST equal the browser Purchase eventID
  // (SuccessView sends the same Paystack reference) so Meta de-duplicates.
  const { first, last } = splitName(order.customerName);
  await sendPurchase({
    eventId: reference,
    value: order.total,
    contents: order.items.map((i) => ({
      id:
        i.type === "original" && i.originalId != null
          ? `original_${i.originalId}`
          : "print",
      quantity: i.quantity ?? 1,
      item_price: i.price,
    })),
    customer: {
      email: order.customerEmail,
      phone: order.customerPhone,
      firstName: first,
      lastName: last,
      // Captured at checkout from the customer's browser and stored on the
      // order — lets Meta match this server event to the same person. Null on
      // older orders (pre-migration) or when the customer had no pixel cookies.
      fbp: order.fbp ?? null,
      fbc: order.fbc ?? null,
    },
    eventSourceUrl: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`
      : undefined,
  });

  return "fulfilled";
}
