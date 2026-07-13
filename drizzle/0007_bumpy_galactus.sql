CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"rating" integer DEFAULT 5 NOT NULL,
	"image_url" text,
	"image_public_id" varchar(255),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "kind" varchar(20) DEFAULT 'affiliate' NOT NULL;--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "stats_token" varchar(64);--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_stats_token_unique" UNIQUE("stats_token");