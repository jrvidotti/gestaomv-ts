ALTER TABLE `factoring_anexos` ADD `pessoa_id` integer REFERENCES factoring_pessoas(id);--> statement-breakpoint
ALTER TABLE `factoring_anexos` ADD `cliente_id` integer REFERENCES factoring_clientes(id);--> statement-breakpoint
ALTER TABLE `factoring_anexos` ADD `operacao_id` integer REFERENCES factoring_operacoes(id);--> statement-breakpoint
ALTER TABLE `factoring_anexos` ADD `documento_id` integer REFERENCES factoring_documentos(id);--> statement-breakpoint
ALTER TABLE `factoring_anexos` DROP COLUMN `tipo_entidade`;--> statement-breakpoint
ALTER TABLE `factoring_anexos` DROP COLUMN `id_entidade`;