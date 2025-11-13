CREATE TABLE `metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`parcel_id` integer,
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
