import { db } from "../index";
import {
  orders,
  orderItems,
  paymentEvents,
  type PaymentEvent,
  type Order,
  type OrderItem,
  type NewOrder,
  type NewOrderItem,
} from "../schema";
import { eq, desc, inArray, and, gte, lte, isNotNull } from "drizzle-orm";
import { paymentStatusFor, type OrderStatus } from "../../constants";

/**
 * For the list view — gets all orders along with their items.
 * Two queries (one for orders, one for items joined back in JS) to avoid
 * GROUP BY complexity on the HTTP driver.
 */
export async function getAllOrdersWithItems(): Promise<OrderWithItems[]> {
  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const itemsByOrderId = new Map<number, OrderItem[]>();
  for (const item of itemRows) {
    const arr = itemsByOrderId.get(item.orderId) ?? [];
    arr.push(item);
    itemsByOrderId.set(item.orderId, arr);
  }

  return orderRows.map((o) => ({
    ...o,
    items: itemsByOrderId.get(o.id) ?? [],
  }));
}

/**
 * Order-level rows for the admin transactions table and the CSV export.
 * No items joined — the table shows transaction details (customer, amount,
 * reference, status), not artwork. `from`/`to` bound createdAt inclusively;
 * omit either side for an open range, both for everything.
 */
export async function getOrdersFiltered(range?: {
  from?: Date;
  to?: Date;
}): Promise<Order[]> {
  const conds = [];
  if (range?.from) conds.push(gte(orders.createdAt, range.from));
  if (range?.to) conds.push(lte(orders.createdAt, range.to));
  const where = conds.length ? and(...conds) : undefined;

  return db.select().from(orders).where(where).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order | undefined> {
  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Note: Neon HTTP driver doesn't support transactions, so this is two separate
 * inserts. If items insert fails after order insert succeeds, we'd have an
 * orphan order. For the gallery's volume, acceptable; revisit if it grows.
 */
export async function createOrder(
  order: Omit<
    NewOrder,
    "id" | "createdAt" | "updatedAt" | "notes?: string | null;"
  >,
  items: Omit<NewOrderItem, "id" | "orderId">[],
): Promise<OrderWithItems> {
  const [createdOrder] = await db.insert(orders).values(order).returning();
  const itemsWithOrderId = items.map((item) => ({
    ...item,
    orderId: createdOrder.id,
  }));
  const createdItems = await db
    .insert(orderItems)
    .values(itemsWithOrderId)
    .returning();
  return { ...createdOrder, items: createdItems };
}

export async function getOrderById(
  id: number,
): Promise<OrderWithItems | undefined> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) return undefined;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));
  return { ...order, items };
}

export async function getOrderByReference(
  reference: string,
): Promise<OrderWithItems | undefined> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentReference, reference))
    .limit(1);
  if (!order) return undefined;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

/**
 * Record the first (Paystack) payment — only if nothing has been recorded yet.
 * Returns the order if THIS call made the transition, else undefined — the
 * idempotency guard so concurrent webhook + callback fulfill exactly once.
 * `amountNaira` is the verified amount Paystack took, which the caller has
 * already checked equals the order total at that moment.
 */
export async function markOrderPaidByReference(
  reference: string,
  amountNaira: number,
): Promise<Order | undefined> {
  const [updated] = await db
    .update(orders)
    .set({
      amountPaid: amountNaira,
      paymentStatus: "paid",
      updatedAt: new Date(),
    })
    .where(
      and(eq(orders.paymentReference, reference), eq(orders.amountPaid, 0)),
    )
    .returning();
  return updated;
}

/**
 * Add a later payment (e.g. the delivery fee paid by transfer) and re-derive
 * the payment status. Returns undefined if the order doesn't exist.
 */
export async function recordBalancePayment(
  id: number,
  amountNaira: number,
): Promise<Order | undefined> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) return undefined;

  const newPaid = order.amountPaid + amountNaira;
  const [updated] = await db
    .update(orders)
    .set({
      amountPaid: newPaid,
      paymentStatus: paymentStatusFor(newPaid, order.total),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

export async function getAllOrders(): Promise<Order[]> {
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

/**
 * Record the delivery fee the gallery agreed with the customer (outside Lagos,
 * or pieces too big for the van). Clears the pending flag, and re-derives the
 * payment status: the total just grew, so a fully-paid order becomes part-paid
 * until the delivery fee is received.
 */
export async function setDeliveryQuote(
  id: number,
  shipping: number,
  total: number,
  amountPaid: number,
): Promise<Order | undefined> {
  const [updated] = await db
    .update(orders)
    .set({
      shipping,
      total,
      paymentStatus: paymentStatusFor(amountPaid, total),
      deliveryQuotePending: false,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

// ── Payment activity ────────────────────────────────────────────

/** Record a payment signal. Never throws — logging must not break payments. */
export async function logPaymentEvent(e: {
  source: "webhook" | "return" | "admin";
  event?: string | null;
  reference?: string | null;
  amount?: number | null;
  outcome: string;
}): Promise<void> {
  try {
    await db.insert(paymentEvents).values({
      source: e.source,
      event: e.event?.slice(0, 50) ?? null,
      reference: e.reference?.slice(0, 100) ?? null,
      amount:
        e.amount != null && Number.isFinite(e.amount)
          ? Math.round(e.amount)
          : null,
      outcome: e.outcome.slice(0, 30),
    });
  } catch (err) {
    console.error("logPaymentEvent failed", err);
  }
}

export async function getPaymentEvents(
  reference: string,
): Promise<PaymentEvent[]> {
  return db
    .select()
    .from(paymentEvents)
    .where(eq(paymentEvents.reference, reference))
    .orderBy(desc(paymentEvents.createdAt))
    .limit(30);
}

/** Unpaid orders that have a Paystack reference — candidates for a payment check. */
export async function getUnpaidOrdersWithReference(
  limit: number,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "unpaid"),
        isNotNull(orders.paymentReference),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
