CREATE TABLE "payment_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(20) NOT NULL,
	"event" varchar(50),
	"reference" varchar(100),
	"amount" integer,
	"outcome" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
