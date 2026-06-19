CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"inviter_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	"status" text DEFAULT 'active' NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"onboarding_status" text DEFAULT 'not_started' NOT NULL,
	"onboarding_step" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcel_crop_seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"year" integer NOT NULL,
	"yield_actual_kg" numeric(12, 2),
	"yield_target_kg" numeric(12, 2),
	"expected_yield_kg" numeric(12, 2),
	"target_price_per_kg" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parcel_crop_season_unique" UNIQUE("parcel_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "parcel_crops" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"variety" text,
	"soil_type" text,
	"planting_date" timestamp,
	"plant_count" integer,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parcel_crops_parcel_id_unique" UNIQUE("parcel_id")
);
--> statement-breakpoint
CREATE TABLE "parcel_location" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"refcat" text,
	"province" text,
	"municipality" text,
	"street_type" text,
	"street_name" text,
	"street_number" text,
	"postal_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parcel_location_parcel_id_unique" UNIQUE("parcel_id")
);
--> statement-breakpoint
CREATE TABLE "parcel_station" (
	"parcel_id" text PRIMARY KEY NOT NULL,
	"primary_station_id" text NOT NULL,
	"fallback_stations" jsonb NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcel_weather" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"range_start" date NOT NULL,
	"range_end" date NOT NULL,
	"status" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"risks" jsonb NOT NULL,
	"recommendations" jsonb,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"algorithm_version" text NOT NULL,
	CONSTRAINT "parcel_weather_parcel_id_unique" UNIQUE("parcel_id")
);
--> statement-breakpoint
CREATE TABLE "parcels" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"crop_type" text NOT NULL,
	"irrigation_type" text,
	"area_ha" numeric(10, 4),
	"area_m2" integer,
	"centroid" geometry(Point, 4326),
	"polygon" geometry(Polygon, 4326),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" text NOT NULL,
	"stripe_subscription_item_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_module_unique" UNIQUE("organization_id","module_id")
);
--> statement-breakpoint
CREATE TABLE "plan_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"max_members" integer NOT NULL,
	"max_parcels" integer NOT NULL,
	"max_storage_mb" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_limits_plan_unique" UNIQUE("plan")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id"),
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "weather_station" (
	"id" text PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"name" text NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"altitude" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weather_station_station_id_unique" UNIQUE("station_id")
);
--> statement-breakpoint
CREATE TABLE "market_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"product" text NOT NULL,
	"grade" text NOT NULL,
	"market" text,
	"price" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"date" date NOT NULL,
	"currency" text DEFAULT 'EUR',
	"trend" text,
	"source" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parcel_cashflow_daily" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"date" date NOT NULL,
	"income" numeric(12, 2) DEFAULT '0',
	"expense" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parcel_financial_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"total_income" numeric(12, 2) DEFAULT '0',
	"total_expense" numeric(12, 2) DEFAULT '0',
	"profit" numeric(12, 2) DEFAULT '0',
	"total_kg" numeric(12, 2) DEFAULT '0',
	"cost_per_kg" numeric(12, 4),
	"revenue_per_kg" numeric(12, 4),
	"margin_per_kg" numeric(12, 4),
	"avg_market_price" numeric(12, 4),
	"margin_vs_market" numeric(12, 4),
	"expected_yield_kg" numeric(12, 2),
	"expected_revenue" numeric(12, 2),
	"expected_profit" numeric(12, 2),
	"calculation_version" text DEFAULT 'v1',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parcel_financial_unique" UNIQUE("parcel_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parcel_id" text,
	"user_id" text,
	"concept" text NOT NULL,
	"description" text,
	"flow" text NOT NULL,
	"date" date NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"meta" jsonb,
	"payment_method" text,
	"invoice_number" text,
	"campaign_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parcel_id" text,
	"task_type" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "harvest_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parcel_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"delivery_date" date NOT NULL,
	"destination_name" text,
	"raw_quantity" numeric(12, 2) NOT NULL,
	"raw_unit" text NOT NULL,
	"conversion_rate" numeric(5, 2),
	"processed_quantity" numeric(12, 2) NOT NULL,
	"processed_unit" text NOT NULL,
	"grade" text,
	"quantity_remaining" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'stored' NOT NULL,
	"target_sale_price_per_unit" numeric(10, 4),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvest_sales" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"delivery_id" text NOT NULL,
	"parcel_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"transaction_id" text,
	"sale_date" date NOT NULL,
	"quantity_sold" numeric(12, 2) NOT NULL,
	"price_per_unit" numeric(10, 4) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"buyer_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_crop_seasons" ADD CONSTRAINT "parcel_crop_seasons_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_crop_seasons" ADD CONSTRAINT "parcel_crop_seasons_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_crops" ADD CONSTRAINT "parcel_crops_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_location" ADD CONSTRAINT "parcel_location_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_station" ADD CONSTRAINT "parcel_station_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_station" ADD CONSTRAINT "parcel_station_primary_station_id_weather_station_id_fk" FOREIGN KEY ("primary_station_id") REFERENCES "public"."weather_station"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_weather" ADD CONSTRAINT "parcel_weather_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_cashflow_daily" ADD CONSTRAINT "parcel_cashflow_daily_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_cashflow_daily" ADD CONSTRAINT "parcel_cashflow_daily_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_financial_summaries" ADD CONSTRAINT "parcel_financial_summaries_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcel_financial_summaries" ADD CONSTRAINT "parcel_financial_summaries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_deliveries" ADD CONSTRAINT "harvest_deliveries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_deliveries" ADD CONSTRAINT "harvest_deliveries_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_deliveries" ADD CONSTRAINT "harvest_deliveries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_sales" ADD CONSTRAINT "harvest_sales_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_sales" ADD CONSTRAINT "harvest_sales_delivery_id_harvest_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."harvest_deliveries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_sales" ADD CONSTRAINT "harvest_sales_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_sales" ADD CONSTRAINT "harvest_sales_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_sales" ADD CONSTRAINT "harvest_sales_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitations_organization_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_organization_id_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_roles_organization_id_idx" ON "organization_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "parcels_organization_id_idx" ON "parcels" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "market_prices_product_grade_date_idx" ON "market_prices" USING btree ("product","grade","date","market");--> statement-breakpoint
CREATE INDEX "parcel_cashflow_parcel_campaign_date_idx" ON "parcel_cashflow_daily" USING btree ("parcel_id","campaign_id","date");--> statement-breakpoint
CREATE INDEX "parcel_cashflow_campaign_date_idx" ON "parcel_cashflow_daily" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "parcel_financial_campaign_only_idx" ON "parcel_financial_summaries" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "transactions_organization_id_idx" ON "transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "transactions_org_date_idx" ON "transactions" USING btree ("organization_id","date");--> statement-breakpoint
CREATE INDEX "transactions_parcel_id_idx" ON "transactions" USING btree ("parcel_id");--> statement-breakpoint
CREATE INDEX "transactions_org_parcel_date_idx" ON "transactions" USING btree ("organization_id","parcel_id","date");--> statement-breakpoint
CREATE INDEX "tasks_organization_id_idx" ON "tasks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tasks_org_start_date_idx" ON "tasks" USING btree ("organization_id","start_date");--> statement-breakpoint
CREATE INDEX "tasks_org_parcel_idx" ON "tasks" USING btree ("organization_id","parcel_id");--> statement-breakpoint
CREATE INDEX "tasks_org_status_idx" ON "tasks" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "campaigns_is_active_idx" ON "campaigns" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "harvest_deliveries_org_idx" ON "harvest_deliveries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "harvest_deliveries_parcel_campaign_idx" ON "harvest_deliveries" USING btree ("parcel_id","campaign_id");--> statement-breakpoint
CREATE INDEX "harvest_deliveries_org_status_idx" ON "harvest_deliveries" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "harvest_sales_delivery_idx" ON "harvest_sales" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "harvest_sales_org_campaign_idx" ON "harvest_sales" USING btree ("organization_id","campaign_id");