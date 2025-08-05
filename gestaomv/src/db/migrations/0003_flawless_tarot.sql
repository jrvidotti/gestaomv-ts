PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_tagone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`usuario_tagone` text NOT NULL,
	`tagone_cookie` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_tagone`("id", "user_id", "usuario_tagone", "tagone_cookie", "created_at", "updated_at") SELECT "id", "user_id", "usuario_tagone", "tagone_cookie", "created_at", "updated_at" FROM `user_tagone`;--> statement-breakpoint
DROP TABLE `user_tagone`;--> statement-breakpoint
ALTER TABLE `__new_user_tagone` RENAME TO `user_tagone`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_tagone_user_id_unique` ON `user_tagone` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_tagone_usuario_tagone_unique` ON `user_tagone` (`usuario_tagone`);