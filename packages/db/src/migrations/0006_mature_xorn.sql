CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parcel_id" text,
	"dedupe_key" text NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"details" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"dismissed_at" timestamp,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recommendations_org_dedupe_key_unique" UNIQUE("organization_id","dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recommendation_id" text;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recommendations_org_parcel_status_idx" ON "recommendations" USING btree ("organization_id","parcel_id","status");--> statement-breakpoint
CREATE INDEX "recommendations_org_status_expires_idx" ON "recommendations" USING btree ("organization_id","status","expires_at");--> statement-breakpoint
INSERT INTO "recommendations" (
	"id",
	"organization_id",
	"parcel_id",
	"dedupe_key",
	"type",
	"source",
	"title",
	"details",
	"priority",
	"status",
	"expires_at"
)
SELECT
	gen_random_uuid()::text,
	p."organization_id",
	pw."parcel_id",
	'legacy:' || pw."parcel_id" || ':' || idx::text || ':' || md5(
		CASE
			WHEN jsonb_typeof(rec) = 'string' THEN rec #>> '{}'
			ELSE coalesce(rec->>'message', rec->>'details', '')
		END
	),
	CASE
		WHEN jsonb_typeof(rec) = 'string' THEN 'general'
		ELSE coalesce(rec->>'type', 'general')
	END,
	'weather',
	CASE
		WHEN jsonb_typeof(rec) = 'string' THEN rec #>> '{}'
		ELSE coalesce(rec->>'message', 'Recomendación')
	END,
	CASE
		WHEN jsonb_typeof(rec) = 'string' THEN rec #>> '{}'
		ELSE coalesce(rec->>'details', rec->>'message', '')
	END,
	coalesce(rec->>'priority', 'medium'),
	'pending',
	now() + interval '7 days'
FROM "parcel_weather" pw
INNER JOIN "parcels" p ON p."id" = pw."parcel_id"
CROSS JOIN LATERAL jsonb_array_elements(
	CASE
		WHEN jsonb_typeof(pw."recommendations") = 'array' THEN pw."recommendations"
		ELSE '[]'::jsonb
	END
) WITH ORDINALITY AS t(rec, idx)
WHERE pw."recommendations" IS NOT NULL
ON CONFLICT ON CONSTRAINT "recommendations_org_dedupe_key_unique" DO NOTHING;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_weather" DROP COLUMN "recommendations";