CREATE TABLE `readwise` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`lastFetchedAt` integer,
	`lastFetchedStatus` text DEFAULT 'pending',
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`itemCount` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `readwise_userId_idx` ON `readwise` (`userId`);--> statement-breakpoint
ALTER TABLE `user` ADD `readwiseToken` text;