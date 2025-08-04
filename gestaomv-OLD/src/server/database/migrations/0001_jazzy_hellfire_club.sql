PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`avatar` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "name", "is_active", "avatar", "created_at", "updated_at") SELECT "id", "email", "password", "name", "is_active", "avatar", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `empresas` ADD `unidade_padrao_id` integer REFERENCES unidades(id);--> statement-breakpoint
CREATE UNIQUE INDEX `materiais_unique` ON `materiais` (`tipo_material_id`,`nome`,`unidade_medida_id`);