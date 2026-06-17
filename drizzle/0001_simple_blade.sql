CREATE TABLE "ar_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"cache_key" varchar(512) NOT NULL,
	"glb_url" text NOT NULL,
	"usdz_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ar_models_cache_key_unique" UNIQUE("cache_key")
);
