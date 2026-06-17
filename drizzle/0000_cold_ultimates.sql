CREATE TABLE "archive_prints" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" varchar(255) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"type" varchar(20) DEFAULT 'print' NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" varchar(255),
	"price" integer NOT NULL,
	"frame_name" varchar(255) NOT NULL,
	"glass" boolean DEFAULT false NOT NULL,
	"size_label" varchar(100) NOT NULL,
	"frame_id" varchar(100),
	"size_id" varchar(50),
	"original_id" integer,
	"title" varchar(255),
	"artist" varchar(255),
	"year" integer
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"delivery_method" varchar(20) NOT NULL,
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100),
	"subtotal" integer NOT NULL,
	"shipping" integer NOT NULL,
	"total" integer NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"payment_reference" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "originals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"medium" varchar(255) NOT NULL,
	"width_inches" real NOT NULL,
	"height_inches" real NOT NULL,
	"price" integer NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" varchar(255),
	"description" text NOT NULL,
	"frame_style" varchar(20) NOT NULL,
	"frame_shape" varchar(20),
	"frame_color" varchar(20) NOT NULL,
	"glass" boolean DEFAULT false NOT NULL,
	"sold_at" timestamp,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "originals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;