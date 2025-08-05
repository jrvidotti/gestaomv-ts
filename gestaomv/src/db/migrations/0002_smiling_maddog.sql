PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_alm_solicitacoes_material` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`solicitante_id` integer NOT NULL,
	`unidade_id` integer NOT NULL,
	`aprovador_id` integer,
	`atendido_por_id` integer,
	`data_operacao` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`data_aprovacao` text,
	`data_atendimento` text,
	`status` text DEFAULT 'PENDENTE' NOT NULL,
	`observacoes` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`solicitante_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aprovador_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`atendido_por_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_alm_solicitacoes_material`("id", "solicitante_id", "unidade_id", "aprovador_id", "atendido_por_id", "data_operacao", "data_aprovacao", "data_atendimento", "status", "observacoes", "criado_em", "atualizado_em") SELECT "id", "solicitante_id", "unidade_id", "aprovador_id", "atendido_por_id", "data_operacao", "data_aprovacao", "data_atendimento", "status", "observacoes", "criado_em", "atualizado_em" FROM `alm_solicitacoes_material`;--> statement-breakpoint
DROP TABLE `alm_solicitacoes_material`;--> statement-breakpoint
ALTER TABLE `__new_alm_solicitacoes_material` RENAME TO `alm_solicitacoes_material`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `solicitacoes_material_solicitante_id_idx` ON `alm_solicitacoes_material` (`solicitante_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_unidade_id_idx` ON `alm_solicitacoes_material` (`unidade_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_aprovador_id_idx` ON `alm_solicitacoes_material` (`aprovador_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_atendido_por_id_idx` ON `alm_solicitacoes_material` (`atendido_por_id`);