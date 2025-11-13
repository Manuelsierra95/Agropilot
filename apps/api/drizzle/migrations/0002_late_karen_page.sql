CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`parcel_id` integer NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`concept` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text,
	`invoice_number` text,
	`date` integer NOT NULL,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parcel_id`) REFERENCES `parcels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`parcel_id` integer NOT NULL,
	`metric_type` text NOT NULL,
	`value` real NOT NULL,
	`previous_value` real,
	`unit` text NOT NULL,
	`source` text DEFAULT 'manual',
	`metadata` text,
	`date` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parcel_id`) REFERENCES `parcels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_metrics`("id", "user_id", "parcel_id", "metric_type", "value", "previous_value", "unit", "source", "metadata", "date", "created_at", "updated_at") SELECT "id", "user_id", "parcel_id", "metric_type", "value", "previous_value", "unit", "source", "metadata", "date", "created_at", "updated_at" FROM `metrics`;--> statement-breakpoint
DROP TABLE `metrics`;--> statement-breakpoint
ALTER TABLE `__new_metrics` RENAME TO `metrics`;--> statement-breakpoint
PRAGMA foreign_keys=ON;