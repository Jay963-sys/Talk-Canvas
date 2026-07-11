import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── ARTISTS ─────────────────────────────────────────────────────
// Multi-artist catalog. The gallery's own work lives under a "house"
// artist row ("Talk Canvas"); attributed third-party works get their
// own rows. `featured` drives the curated "Popular Artists" surface.
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  portraitUrl: text("portrait_url"),
  portraitPublicId: varchar("portrait_public_id", { length: 255 }),
  location: varchar("location", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  website: varchar("website", { length: 255 }),

  // Curated "Popular Artists" set
  featured: boolean("featured").default(false).notNull(),

  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export const originals = pgTable("originals", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),

  // Legacy denormalized attribution. Kept as a display fallback and for
  // full-text search; `artistId` is the source of truth for linking.
  artist: varchar("artist", { length: 255 }).notNull(),

  // Structured FK into artists. Nullable so the initial ALTER applies to
  // existing rows; the backfill script populates it. onDelete "set null"
  // keeps a work intact if its artist row is later removed (the `artist`
  // text snapshot above survives as the display fallback).
  artistId: integer("artist_id").references(() => artists.id, {
    onDelete: "set null",
  }),

  year: integer("year").notNull(),
  medium: varchar("medium", { length: 255 }).notNull(),

  // Structured dimensions (in inches) for AR + display
  widthInches: real("width_inches").notNull(),
  heightInches: real("height_inches").notNull(),

  // NGN as integer
  price: integer("price").notNull(),

  imageUrl: text("image_url").notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  description: text("description").notNull(),

  // Frame info (each original is sold as displayed with a specific frame)
  frameStyle: varchar("frame_style", { length: 20 }).notNull(), // "regular" | "antique"
  frameShape: varchar("frame_shape", { length: 20 }), // "floating" | "box" — null for antique
  frameColor: varchar("frame_color", { length: 20 }).notNull(), // "black" | "brown" | "gold" | "white"
  glass: boolean("glass").default(false).notNull(),

  // One-of-one sold tracking
  soldAt: timestamp("sold_at"),

  // Product-line discriminator. Artist works are one-of-one — marked sold once
  // purchased and gone for good. Talk Canvas Originals are recreatable house
  // designs, repainted to order, and never sell out. Drives the mark-sold
  // logic in fulfillment and any "Sold Out" state in the UI.
  oneOfOne: boolean("one_of_one").default(false).notNull(),

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
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("unpaid")
    .notNull(),
  paymentReference: varchar("payment_reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  // Discriminator: "print" | "original"
  type: varchar("type", { length: 20 }).default("print").notNull(),

  // Universal
  imageUrl: text("image_url").notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  price: integer("price").notNull(),

  // Unit price is `price`; the line total is price * quantity. One-of-one
  // works are always 1.
  quantity: integer("quantity").default(1).notNull(),

  // Frame info — both types have a frame
  frameName: varchar("frame_name", { length: 255 }).notNull(),
  glass: boolean("glass").default(false).notNull(),
  sizeLabel: varchar("size_label", { length: 100 }).notNull(),

  // Print-only (nullable)
  frameId: varchar("frame_id", { length: 100 }),
  sizeId: varchar("size_id", { length: 50 }),

  // Original-only (nullable). originalId is a soft FK — we keep the order
  // record intact even if the original is later deleted.
  originalId: integer("original_id"),
  title: varchar("title", { length: 255 }),
  artist: varchar("artist", { length: 255 }),
  year: integer("year"),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// For admin login
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Original = typeof originals.$inferSelect;
export type NewOriginal = typeof originals.$inferInsert;

// ── ARCHIVE PRINTS ──────────────────────────────────────────────
// Growing, low-metadata collection. The image *is* the product; frame,
// size, and price come from the configurator at selection, like an upload.
export const archivePrints = pgTable("archive_prints", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: varchar("image_public_id", { length: 255 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  collection: varchar("collection", { length: 100 }),
  displayOrder: integer("display_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ArchivePrint = typeof archivePrints.$inferSelect;
export type NewArchivePrint = typeof archivePrints.$inferInsert;

// ── AR MODEL CACHE ──────────────────────────────────────────────
// Generated frame models keyed by image + frame + size + glass, so repeated
// AR views of the same piece reuse one upload instead of regenerating.
export const arModels = pgTable("ar_models", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 512 }).notNull().unique(),
  glbUrl: text("glb_url").notNull(),
  usdzUrl: text("usdz_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ArModel = typeof arModels.$inferSelect;
