CREATE TABLE `consultas_cnpj` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cnpj` text NOT NULL,
	`dados` text DEFAULT '{}' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultas_cnpj_cnpj_unique` ON `consultas_cnpj` (`cnpj`);