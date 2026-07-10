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

/** Runs exactly once per confirmed order: mark one-of-one originals sold + send emails. */
export async function fulfillOrder(order: OrderWithItems): Promise<void> {
  const originalIds = order.items
    .filter((i) => i.type === "original" && i.originalId != null)
    .map((i) => i.originalId as number);

  if (originalIds.length > 0) {
    // Only one-of-one works (artist originals) are marked sold. Talk Canvas
    // Originals are recreatable house designs — repainted to order — so they
    // must stay available after purchase.
    const originals = await getOriginalsByIds(originalIds);
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
    title: i.title,
    artist: i.artist,
    year: i.year,
  }));

  const galleryEmail = process.env.GALLERY_EMAIL;

  const emailJobs: Promise<unknown>[] = [
    sendEmail({
      to: order.customerEmail,
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
  return "fulfilled";
}
