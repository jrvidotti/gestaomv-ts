PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_empresas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`razao_social` text NOT NULL,
	`nome_fantasia` text,
	`cnpj` text NOT NULL,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO `__new_empresas`("id", "razao_social", "nome_fantasia", "cnpj", "pontoweb_id", "criado_em", "atualizado_em") SELECT "id", "razao_social", "nome_fantasia", "cnpj", "pontoweb_id", "criado_em", "atualizado_em" FROM `empresas`;--> statement-breakpoint
DROP TABLE `empresas`;--> statement-breakpoint
ALTER TABLE `__new_empresas` RENAME TO `empresas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_cnpj_unique` ON `empresas` (`cnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_pontoweb_id_unique` ON `empresas` (`pontoweb_id`);