ALTER TABLE "orders" ADD COLUMN "amount_paid" integer DEFAULT 0 NOT NULL;
UPDATE "orders" SET "amount_paid" = "total" WHERE "payment_status" = 'paid';