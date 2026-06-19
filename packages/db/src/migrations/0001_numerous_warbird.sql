CREATE TABLE "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"action" text NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"duration" integer,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "logs_source_idx" ON "logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "logs_source_action_idx" ON "logs" USING btree ("source","action");--> statement-breakpoint
CREATE INDEX "logs_source_created_idx" ON "logs" USING btree ("source","created_at");