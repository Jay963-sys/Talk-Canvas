ALTER TABLE "archive_prints" ADD COLUMN "set_id" integer;--> statement-breakpoint
ALTER TABLE "archive_prints" ADD COLUMN "set_position" integer;--> statement-breakpoint
ALTER TABLE "archive_prints" ADD COLUMN "set_size" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "set_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "set_position" integer;