CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`checkout_mode` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_provider` text,
	`provider_reference` text,
	`currency` text NOT NULL,
	`subtotal_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`buyer_name` text,
	`buyer_email` text,
	`receipt_access_token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_provider_reference_unique` ON `orders` (`payment_provider`,`provider_reference`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_event_id` text NOT NULL,
	`provider_reference` text NOT NULL,
	`order_id` text NOT NULL,
	`event_type` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`payload_hash` text NOT NULL,
	`occurred_at` text NOT NULL,
	`received_at` text NOT NULL,
	`processed_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_provider_event_unique` ON `payment_events` (`provider`,`provider_event_id`);--> statement-breakpoint
CREATE INDEX `payment_events_order_id_idx` ON `payment_events` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_events_unprocessed_idx` ON `payment_events` (`processed_at`);