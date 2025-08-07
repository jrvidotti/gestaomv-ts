CREATE TABLE `fact_consultas_cpf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cpf` text NOT NULL,
	`dados` text DEFAULT '{}' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fact_consultas_cpf_cpf_unique` ON `fact_consultas_cpf` (`cpf`);