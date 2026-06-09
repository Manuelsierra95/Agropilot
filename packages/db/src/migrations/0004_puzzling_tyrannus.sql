DROP INDEX "market_prices_product_date_idx";--> statement-breakpoint
ALTER TABLE "parcels" ALTER COLUMN "area_ha" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parcels" ALTER COLUMN "area_m2" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "market_prices" ADD COLUMN "grade" text;--> statement-breakpoint
UPDATE "market_prices"
SET "grade" = CASE
  WHEN "market" LIKE '%(virgen_extra)' THEN 'virgen_extra'
  WHEN "market" LIKE '%(lampante)' THEN 'lampante'
  WHEN "market" LIKE '%(virgen)' THEN 'virgen'
  ELSE 'virgen_extra'
END
WHERE "grade" IS NULL;--> statement-breakpoint
ALTER TABLE "market_prices" ALTER COLUMN "grade" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "market_prices_product_grade_date_idx" ON "market_prices" USING btree ("product","grade","date");