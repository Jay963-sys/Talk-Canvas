import { db } from "../index";
import {
  orders,
  orderItems,
  type Order,
  type OrderItem,
  type NewOrder,
  type NewOrderItem,
} from "../schema";
import { eq, desc, inArray, and, ne, gte, lte } from "drizzle-orm";
import { type OrderStatus } from "../../constants";

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
 * Atomically flip to paid only if not already paid. Returns the order if
 * THIS call made the transition, else undefined — the idempotency guard so
 * concurrent webhook + callback fulfill exactly once.
 */
export async function markOrderPaidByReference(
  reference: string,
): Promise<Order | undefined> {
  const [updated] = await db
    .update(orders)
    .set({ paymentStatus: "paid", updatedAt: new Date() })
    .where(
      and(
        eq(orders.paymentReference, reference),
        ne(orders.paymentStatus, "paid"),
      ),
    )
    .returning();
  return updated;
}

export async function getAllOrders(): Promise<Order[]> {
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

/**
 * Record the delivery fee the gallery agreed with an outside-Lagos customer.
 * Clears the pending flag so the order stops showing as unquoted.
 */
export async function setDeliveryQuote(
  id: number,
  shipping: number,
  total: number,
): Promise<Order | undefined> {
  const [updated] = await db
    .update(orders)
    .set({
      shipping,
      total,
      deliveryQuotePending: false,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}
