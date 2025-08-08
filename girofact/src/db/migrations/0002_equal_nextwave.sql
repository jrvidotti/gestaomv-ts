ALTER TABLE `factoring_consultas_cpf` RENAME TO `consultas_cpf`;--> statement-breakpoint
DROP INDEX `factoring_consultas_cpf_cpf_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `consultas_cpf_cpf_unique` ON `consultas_cpf` (`cpf`);