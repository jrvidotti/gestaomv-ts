CREATE TABLE `checklist_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_id` integer NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text,
	`tipo` text NOT NULL,
	`obrigatorio` integer DEFAULT true NOT NULL,
	`peso` real DEFAULT 1 NOT NULL,
	`ordem` integer NOT NULL,
	`ativo` integer DEFAULT true NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`template_id`) REFERENCES `checklist_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `checklist_items_template_id_idx` ON `checklist_items` (`template_id`);--> statement-breakpoint
CREATE INDEX `checklist_items_ordem_idx` ON `checklist_items` (`template_id`,`ordem`);--> statement-breakpoint
CREATE INDEX `checklist_items_ativo_idx` ON `checklist_items` (`ativo`);--> statement-breakpoint
CREATE TABLE `checklist_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`periodicidade` text NOT NULL,
	`ativo` integer DEFAULT true NOT NULL,
	`criado_por_id` integer NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`criado_por_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `checklist_templates_nome_idx` ON `checklist_templates` (`nome`);--> statement-breakpoint
CREATE INDEX `checklist_templates_ativo_idx` ON `checklist_templates` (`ativo`);--> statement-breakpoint
CREATE INDEX `checklist_templates_criado_por_idx` ON `checklist_templates` (`criado_por_id`);--> statement-breakpoint
CREATE TABLE `checklist_avaliacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_id` integer NOT NULL,
	`unidade_id` integer NOT NULL,
	`avaliador_id` integer NOT NULL,
	`status` text DEFAULT 'pendente' NOT NULL,
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
CREATE INDEX `checklist_avaliacoes_template_id_idx` ON `checklist_avaliacoes` (`template_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_unidade_id_idx` ON `checklist_avaliacoes` (`unidade_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_avaliador_id_idx` ON `checklist_avaliacoes` (`avaliador_id`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_status_idx` ON `checklist_avaliacoes` (`status`);--> statement-breakpoint
CREATE INDEX `checklist_avaliacoes_data_agendada_idx` ON `checklist_avaliacoes` (`data_agendada`);--> statement-breakpoint
CREATE TABLE `checklist_respostas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`avaliacao_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`valor_nota` integer,
	`valor_boolean` integer,
	`valor_texto` text,
	`observacao` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`avaliacao_id`) REFERENCES `checklist_avaliacoes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `checklist_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `checklist_respostas_avaliacao_id_idx` ON `checklist_respostas` (`avaliacao_id`);--> statement-breakpoint
CREATE INDEX `checklist_respostas_item_id_idx` ON `checklist_respostas` (`item_id`);--> statement-breakpoint
CREATE INDEX `checklist_respostas_unique_idx` ON `checklist_respostas` (`avaliacao_id`,`item_id`);