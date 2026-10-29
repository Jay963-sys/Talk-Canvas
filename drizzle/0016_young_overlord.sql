CREATE TABLE "inspection_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255),
	"address" text NOT NULL,
	"area" varchar(100),
	"preferred_date" varchar(20),
	"message" text,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "installation_requested" boolean DEFAULT false NOT NULL;