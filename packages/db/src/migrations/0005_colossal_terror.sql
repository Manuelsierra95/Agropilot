CREATE INDEX "parcel_cashflow_daily_parcel_campaign_idx" ON "parcel_cashflow_daily" USING btree ("parcel_id","campaign_id");--> statement-breakpoint
CREATE INDEX "parcels_organization_id_idx" ON "parcels" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "parcels_centroid_gist_idx" ON "parcels" USING gist ("centroid");--> statement-breakpoint
CREATE INDEX "parcels_polygon_gist_idx" ON "parcels" USING gist ("polygon");--> statement-breakpoint
CREATE INDEX "weather_station_location_gist_idx" ON "weather_station" USING gist ("location");--> statement-breakpoint
CREATE INDEX "transactions_organization_id_idx" ON "transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "transactions_campaign_id_idx" ON "transactions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "tasks_organization_id_idx" ON "tasks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tasks_parcel_id_idx" ON "tasks" USING btree ("parcel_id");