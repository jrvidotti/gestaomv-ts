ALTER TABLE `solicitacoes_material_itens` RENAME TO `alm_solicitacoes_material_itens`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_alm_solicitacoes_material_itens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`solicitacao_material_id` integer NOT NULL,
	`material_id` integer NOT NULL,
	`qtd_solicitada` integer NOT NULL,
	`qtd_atendida` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`solicitacao_material_id`) REFERENCES `alm_solicitacoes_material`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`material_id`) REFERENCES `alm_materiais`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_alm_solicitacoes_material_itens`("id", "solicitacao_material_id", "material_id", "qtd_solicitada", "qtd_atendida", "criado_em", "atualizado_em") SELECT "id", "solicitacao_material_id", "material_id", "qtd_solicitada", "qtd_atendida", "criado_em", "atualizado_em" FROM `alm_solicitacoes_material_itens`;--> statement-breakpoint
DROP TABLE `alm_solicitacoes_material_itens`;--> statement-breakpoint
ALTER TABLE `__new_alm_solicitacoes_material_itens` RENAME TO `alm_solicitacoes_material_itens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `solicitacoes_material_itens_solicitacao_material_id_idx` ON `alm_solicitacoes_material_itens` (`solicitacao_material_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_itens_material_id_idx` ON `alm_solicitacoes_material_itens` (`material_id`);