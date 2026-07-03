CREATE TABLE "artists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"bio" text,
	"portrait_url" text,
	"portrait_public_id" varchar(255),
	"location" varchar(255),
	"instagram" varchar(255),
	"website" varchar(255),
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "originals" ADD COLUMN "artist_id" integer;--> statement-breakpoint
ALTER TABLE "originals" ADD CONSTRAINT "originals_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE set null ON UPDATE no action;