import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db/queries/orders";
import { sendEmail } from "@/lib/email";
import OrderConfirmation from "@/lib/email/templates/OrderConfirmation";
import OrderNotification from "@/lib/email/templates/OrderNotification";
import { SHIPPING_CONFIG } from "@/data/shipping";

interface OrderItemInput {
  imageUrl: string;
  imagePublicId?: string;
  frameId: string;
  frameName: string;
  glass?: boolean;
  sizeId: string;
  sizeLabel: string;
  price: number;
}

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
    const { customer, deliveryMethod, address, items, shipping } = body;
    const notes =
      typeof body.notes === "string"
        ? body.notes.trim().slice(0, 1000) // cap length
        : null;

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
    if (typeof shipping !== "number" || shipping < 0) {
      return NextResponse.json({ error: "Invalid shipping" }, { status: 400 });
    }

    // Recompute totals server-side — never trust client-submitted money
    const computedSubtotal = items.reduce(
      (sum: number, item: OrderItemInput) => sum + item.price,
      0,
    );
    const computedTotal = computedSubtotal + shipping;

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
        shipping,
        total: computedTotal,
        notes,
        status: "pending",
      },
      items.map((item: OrderItemInput) => ({
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId ?? null,
        frameId: item.frameId,
        frameName: item.frameName,
        glass: item.glass ?? false,
        sizeId: item.sizeId,
        sizeLabel: item.sizeLabel,
        price: item.price,
      })),
    );

    // Send emails — best effort, don't fail the request if email fails
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
      imageUrl: i.imageUrl,
      frameName: i.frameName,
      glass: i.glass,
      sizeLabel: i.sizeLabel,
      price: i.price,
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
