CREATE TABLE `tipos_material` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tipos_material_nome_unique` ON `tipos_material` (`nome`);--> statement-breakpoint
CREATE TABLE `unidades_medida` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unidades_medida_nome_unique` ON `unidades_medida` (`nome`);--> statement-breakpoint
CREATE TABLE `materiais` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`tipo_material_id` text NOT NULL,
	`valor_unitario` real NOT NULL,
	`foto` text,
	`ativo` integer DEFAULT true NOT NULL,
	`unidade_medida_id` text NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`tipo_material_id`) REFERENCES `tipos_material`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidades_medida`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `solicitacoes_material` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`solicitante_id` integer NOT NULL,
	`unidade_id` integer,
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
CREATE INDEX `solicitacoes_material_solicitante_id_idx` ON `solicitacoes_material` (`solicitante_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_unidade_id_idx` ON `solicitacoes_material` (`unidade_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_aprovador_id_idx` ON `solicitacoes_material` (`aprovador_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_atendido_por_id_idx` ON `solicitacoes_material` (`atendido_por_id`);--> statement-breakpoint
CREATE TABLE `solicitacoes_material_itens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`solicitacao_material_id` integer NOT NULL,
	`material_id` integer NOT NULL,
	`qtd_solicitada` integer NOT NULL,
	`qtd_atendida` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`solicitacao_material_id`) REFERENCES `solicitacoes_material`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`material_id`) REFERENCES `materiais`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `solicitacoes_material_itens_solicitacao_material_id_idx` ON `solicitacoes_material_itens` (`solicitacao_material_id`);--> statement-breakpoint
CREATE INDEX `solicitacoes_material_itens_material_id_idx` ON `solicitacoes_material_itens` (`material_id`);--> statement-breakpoint
CREATE TABLE `consultas_cpf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cpf` text NOT NULL,
	`dados` text DEFAULT '{}' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultas_cpf_cpf_unique` ON `consultas_cpf` (`cpf`);--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`razao_social` text NOT NULL,
	`nome_fantasia` text,
	`cnpj` text NOT NULL,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_cnpj_unique` ON `empresas` (`cnpj`);--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_pontoweb_id_unique` ON `empresas` (`pontoweb_id`);--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`user_id`, `role`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_tagone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`usuario_tagone` text NOT NULL,
	`tagone_cookie` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`avatar` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'general' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `unidades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`codigo` integer NOT NULL,
	`empresa_id` integer,
	`endereco` text,
	`cidade` text,
	`estado` text,
	`telefone` text,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unidades_codigo_unique` ON `unidades` (`codigo`);--> statement-breakpoint
CREATE UNIQUE INDEX `unidades_pontoweb_id_unique` ON `unidades` (`pontoweb_id`);--> statement-breakpoint
CREATE TABLE `avaliacoes_experiencia` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`funcionario_id` integer NOT NULL,
	`avaliador_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`data_avaliacao` text NOT NULL,
	`pontualidade` integer NOT NULL,
	`comprometimento` integer NOT NULL,
	`trabalho_equipe` integer NOT NULL,
	`iniciativa` integer NOT NULL,
	`comunicacao` integer NOT NULL,
	`conhecimento_tecnico` integer NOT NULL,
	`media_final` real NOT NULL,
	`recomendacao` text NOT NULL,
	`pontos_fortes` text,
	`pontos_melhoria` text,
	`observacoes` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`avaliador_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `avaliacoes_experiencia_funcionario_id_idx` ON `avaliacoes_experiencia` (`funcionario_id`);--> statement-breakpoint
CREATE INDEX `avaliacoes_experiencia_avaliador_id_idx` ON `avaliacoes_experiencia` (`avaliador_id`);--> statement-breakpoint
CREATE TABLE `avaliacoes_periodicas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`funcionario_id` integer NOT NULL,
	`avaliador_id` integer NOT NULL,
	`periodo_inicial` text NOT NULL,
	`periodo_final` text NOT NULL,
	`data_avaliacao` text NOT NULL,
	`desempenho` integer NOT NULL,
	`comprometimento` integer NOT NULL,
	`trabalho_equipe` integer NOT NULL,
	`lideranca` integer NOT NULL,
	`comunicacao` integer NOT NULL,
	`inovacao` integer NOT NULL,
	`resolucao_problemas` integer NOT NULL,
	`qualidade_trabalho` integer NOT NULL,
	`media_final` real NOT NULL,
	`classificacao` text NOT NULL,
	`metas_anterior` text,
	`avaliacao_metas` text,
	`novas_metas` text,
	`feedback_geral` text,
	`plano_desenvolvimento` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`avaliador_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `avaliacoes_periodicas_funcionario_id_idx` ON `avaliacoes_periodicas` (`funcionario_id`);--> statement-breakpoint
CREATE INDEX `avaliacoes_periodicas_avaliador_id_idx` ON `avaliacoes_periodicas` (`avaliador_id`);--> statement-breakpoint
CREATE TABLE `cargos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`departamento_id` integer NOT NULL,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`departamento_id`) REFERENCES `departamentos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cargos_nome_unique` ON `cargos` (`nome`);--> statement-breakpoint
CREATE UNIQUE INDEX `cargos_pontoweb_id_unique` ON `cargos` (`pontoweb_id`);--> statement-breakpoint
CREATE INDEX `cargos_departamento_id_idx` ON `cargos` (`departamento_id`);--> statement-breakpoint
CREATE TABLE `departamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departamentos_nome_unique` ON `departamentos` (`nome`);--> statement-breakpoint
CREATE UNIQUE INDEX `departamentos_pontoweb_id_unique` ON `departamentos` (`pontoweb_id`);--> statement-breakpoint
CREATE TABLE `equipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`codigo` text NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `equipes_codigo_unique` ON `equipes` (`codigo`);--> statement-breakpoint
CREATE TABLE `equipes_funcionarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`funcionario_id` text NOT NULL,
	`equipe_id` integer NOT NULL,
	`eh_lider` integer DEFAULT false NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`equipe_id`) REFERENCES `equipes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `equipes_funcionarios_funcionario_id_idx` ON `equipes_funcionarios` (`funcionario_id`);--> statement-breakpoint
CREATE INDEX `equipes_funcionarios_equipe_id_idx` ON `equipes_funcionarios` (`equipe_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `funcionarioEquipeUnique` ON `equipes_funcionarios` (`funcionario_id`,`equipe_id`);--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`cpf` text NOT NULL,
	`data_nascimento` text,
	`sexo` text,
	`nome_mae` text,
	`email` text,
	`telefone` text,
	`foto` text,
	`cargo_id` integer NOT NULL,
	`departamento_id` integer NOT NULL,
	`empresa_id` integer,
	`unidade_id` integer,
	`data_admissao` text NOT NULL,
	`data_aviso_previo` text,
	`data_desligamento` text,
	`status` text DEFAULT 'ATIVO' NOT NULL,
	`pontoweb_id` integer,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cargo_id`) REFERENCES `cargos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`departamento_id`) REFERENCES `departamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `funcionarios_pontoweb_id_unique` ON `funcionarios` (`pontoweb_id`);--> statement-breakpoint
CREATE INDEX `funcionarios_cargo_id_idx` ON `funcionarios` (`cargo_id`);--> statement-breakpoint
CREATE INDEX `funcionarios_departamento_id_idx` ON `funcionarios` (`departamento_id`);--> statement-breakpoint
CREATE INDEX `funcionarios_empresa_id_idx` ON `funcionarios` (`empresa_id`);--> statement-breakpoint
CREATE TABLE `user_funcionarios` (
	`user_id` text NOT NULL,
	`funcionario_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_funcionarios_user_id_unique` ON `user_funcionarios` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_funcionarios_funcionario_id_unique` ON `user_funcionarios` (`funcionario_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_funcionarios_unique` ON `user_funcionarios` (`user_id`,`funcionario_id`);