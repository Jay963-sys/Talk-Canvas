import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const originals = pgTable("originals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  medium: varchar("medium", { length: 255 }).notNull(),
  size: varchar("size", { length: 100 }).notNull(),
  price: varchar("price", { length: 100 }).notNull(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  description: text("description").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── ORDERS ──────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull(),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  frameId: varchar("frame_id", { length: 100 }).notNull(),
  frameName: varchar("frame_name", { length: 255 }).notNull(),
  glass: boolean("glass").default(false).notNull(),
  sizeId: varchar("size_id", { length: 50 }).notNull(),
  sizeLabel: varchar("size_label", { length: 100 }).notNull(),
  price: integer("price").notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// For admin login — populated in 9b
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Original = typeof originals.$inferSelect;
export type NewOriginal = typeof originals.$inferInsert;
