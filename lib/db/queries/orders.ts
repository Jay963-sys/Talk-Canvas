import { db } from "../index";
import {
  orders,
  orderItems,
  type Order,
  type OrderItem,
  type NewOrder,
  type NewOrderItem,
} from "../schema";
import { eq, desc, inArray } from "drizzle-orm";
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
  order: Omit<NewOrder, "id" | "createdAt" | "updatedAt">,
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

export async function getAllOrders(): Promise<Order[]> {
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}
