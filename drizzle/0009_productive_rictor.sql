ALTER TABLE "orders" ADD COLUMN "delivery_zone" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_vehicle" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_quote_pending" boolean DEFAULT false NOT NULL;