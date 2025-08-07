PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_checklist_avaliacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_id` integer NOT NULL,
	`unidade_id` integer NOT NULL,
	`avaliador_id` integer NOT NULL,
	`status` text DEFAULT 'PENDENTE' NOT NULL,
	`data_agendada` text,
	`data_inicio` text,
	`data_fim` text,
	`observacoes` text,
	`media_final` real,
	`classificacao` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`template_id`) REFERENCES `checklist_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`avaliador_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_checklist_avaliacoes`("id", "template_id", "unidade_id", "avaliador_id", "status", "data_agendada", "data_inicio", "data_fim", "observacoes", "media_final", "classificacao", "criado_em", "atualizado_em") SELECT "id", "template_id", "unidade_id", "avaliador_id", "status", "data_agendada", "data_inicio", "data_fim", "observacoes", "media_final", "classificacao", "criado_em", "atualizado_em" FROM `checklist_avaliacoes`;--> statement-breakpoint
DROP TABLE `checklist_avaliacoes`;--> statement-breakpoint
ALTER TABLE `__new_checklist_avaliacoes` RENAME TO `checklist_avaliacoes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_template_id_idx` ON `checklist_avaliacoes` (`template_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_unidade_id_idx` ON `checklist_avaliacoes` (`unidade_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_avaliador_id_idx` ON `checklist_avaliacoes` (`avaliador_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_status_idx` ON `checklist_avaliacoes` (`status`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_data_agendada_idx` ON `checklist_avaliacoes` (`data_agendada`);