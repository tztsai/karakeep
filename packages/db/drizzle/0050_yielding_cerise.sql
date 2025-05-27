CREATE TABLE `readwiseBooks` (
	`id` text PRIMARY KEY NOT NULL,
	`readwiseBookId` integer NOT NULL,
	`bookmarkId` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`bookmarkId`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `readwiseBooks_userId_idx` ON `readwiseBooks` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `readwiseBooks_userId_readwiseBookId_unique` ON `readwiseBooks` (`userId`,`readwiseBookId`);--> statement-breakpoint
CREATE TABLE `readwiseHighlights` (
	`id` text PRIMARY KEY NOT NULL,
	`readwiseHighlightId` integer NOT NULL,
	`highlightId` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`highlightId`) REFERENCES `highlights`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `readwiseHighlights_userId_idx` ON `readwiseHighlights` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `readwiseHighlights_userId_readwiseHighlightId_unique` ON `readwiseHighlights` (`userId`,`readwiseHighlightId`);