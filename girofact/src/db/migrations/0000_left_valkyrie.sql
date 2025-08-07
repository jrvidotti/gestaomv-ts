CREATE TABLE `user_roles` (
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`user_id`, `role`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`avatar` text,
	`auth_provider` text DEFAULT 'local' NOT NULL,
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
CREATE TABLE `factoring_carteiras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`banco` text,
	`agencia` text,
	`conta` text,
	`chave_pix` text,
	`user_id` integer NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `factoring_dados_bancarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pessoa_id` integer NOT NULL,
	`banco` text NOT NULL,
	`agencia` text NOT NULL,
	`conta` text NOT NULL,
	`digito_verificador` text NOT NULL,
	`tipo_conta` text DEFAULT 'corrente' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`pessoa_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_banco_agencia_conta` ON `factoring_dados_bancarios` (`banco`,`agencia`,`conta`);--> statement-breakpoint
CREATE TABLE `factoring_pessoas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo_pessoa` text NOT NULL,
	`documento` text NOT NULL,
	`nome_razao_social` text NOT NULL,
	`nome_fantasia` text,
	`data_nascimento_fundacao` text,
	`inscricao_estadual` text,
	`inscricao_municipal` text,
	`nome_mae` text,
	`sexo` text,
	`email` text,
	`cep` text,
	`logradouro` text,
	`numero` text,
	`complemento` text,
	`bairro` text,
	`cidade` text,
	`estado` text,
	`observacoes_gerais` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factoring_pessoas_documento_unique` ON `factoring_pessoas` (`documento`);--> statement-breakpoint
CREATE TABLE `factoring_telefones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pessoa_id` integer NOT NULL,
	`numero` text NOT NULL,
	`principal` integer DEFAULT false NOT NULL,
	`whatsapp` integer DEFAULT false NOT NULL,
	`inativo` integer DEFAULT false NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`pessoa_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `factoring_clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pessoa_id` integer NOT NULL,
	`status` text DEFAULT 'ativo' NOT NULL,
	`observacoes_cliente` text,
	`credito_autorizado` integer DEFAULT false NOT NULL,
	`limite_credito` real DEFAULT 0 NOT NULL,
	`taxa_juros_padrao` real DEFAULT 0 NOT NULL,
	`tarifa_devolucao_cheques` real,
	`tarifa_prorrogacao` real,
	`tarifa_protesto` real,
	`tarifa_resgate` real,
	`data_ultima_analise_credito` text,
	`usuario_responsavel_analise` integer,
	`historico_alteracoes_limite` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`pessoa_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`usuario_responsavel_analise`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factoring_clientes_pessoa_id_unique` ON `factoring_clientes` (`pessoa_id`);--> statement-breakpoint
CREATE TABLE `factoring_contatos_referencia` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`tipo_referencia` text NOT NULL,
	`pessoa_id` integer,
	`nome_completo` text,
	`telefone` text NOT NULL,
	`email` text,
	`documento` text,
	`empresa_organizacao` text,
	`cargo_funcao` text,
	`observacoes` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cliente_id`) REFERENCES `factoring_clientes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pessoa_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `factoring_operacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`cliente_id` integer NOT NULL,
	`taxa_juros` real NOT NULL,
	`valor_liquido` real,
	`status` text DEFAULT 'efetivada' NOT NULL,
	`usuario_aprovador_id` integer,
	`data_aprovacao` text,
	`data_pagamento` text,
	`carteira_id` integer,
	`user_id` integer NOT NULL,
	`observacoes` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cliente_id`) REFERENCES `factoring_clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`usuario_aprovador_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`carteira_id`) REFERENCES `factoring_carteiras`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factoring_operacoes_uid_unique` ON `factoring_operacoes` (`uid`);--> statement-breakpoint
CREATE TABLE `factoring_documentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`seq` integer NOT NULL,
	`operacao_id` integer NOT NULL,
	`tipo_documento` text NOT NULL,
	`data_vencimento` text NOT NULL,
	`valor_documento` real NOT NULL,
	`float` integer DEFAULT 0 NOT NULL,
	`data_vencimento_prorrogada` text,
	`status` text DEFAULT 'pendente' NOT NULL,
	`valor_juros_operacao` real DEFAULT 0 NOT NULL,
	`observacoes` text,
	`foi_devolvido` integer DEFAULT false NOT NULL,
	`emitente_id` integer,
	`avalista_id` integer,
	`numero_documento` text,
	`dados_bancarios_id` integer,
	`numero_cheque` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`operacao_id`) REFERENCES `factoring_operacoes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`emitente_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`avalista_id`) REFERENCES `factoring_pessoas`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`dados_bancarios_id`) REFERENCES `factoring_dados_bancarios`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factoring_documentos_uid_unique` ON `factoring_documentos` (`uid`);--> statement-breakpoint
CREATE TABLE `factoring_ocorrencias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`documento_id` integer NOT NULL,
	`tipo_ocorrencia` text NOT NULL,
	`data_ocorrencia` text NOT NULL,
	`valor_tarifa` real,
	`valor_juros` real,
	`data_vencimento_atual` text,
	`data_vencimento_prorrogada` text,
	`alinea_devolucao` text,
	`user_id` integer NOT NULL,
	`observacao` text,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`documento_id`) REFERENCES `factoring_documentos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `factoring_lancamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`operacao_id` integer,
	`ocorrencia_id` integer,
	`recebimento_id` integer,
	`data_lancamento` text NOT NULL,
	`valor_lancamento` real NOT NULL,
	`tipo_lancamento` text NOT NULL,
	`carteira_id` integer NOT NULL,
	`observacao` text,
	`user_id` integer NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cliente_id`) REFERENCES `factoring_clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`operacao_id`) REFERENCES `factoring_operacoes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`ocorrencia_id`) REFERENCES `factoring_ocorrencias`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`recebimento_id`) REFERENCES `factoring_recebimentos`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`carteira_id`) REFERENCES `factoring_carteiras`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `factoring_recebimentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`data_recebimento` text NOT NULL,
	`valor_recebimento` real NOT NULL,
	`carteira_id` integer NOT NULL,
	`observacao` text,
	`user_id` integer NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cliente_id`) REFERENCES `factoring_clientes`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`carteira_id`) REFERENCES `factoring_carteiras`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `factoring_anexos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo_entidade` text NOT NULL,
	`id_entidade` integer NOT NULL,
	`observacao` text,
	`tipo_arquivo` text NOT NULL,
	`chave_arquivo_s3` text,
	`nome_arquivo` text,
	`tamanho_arquivo` integer,
	`tipo_mime` text,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'ativo' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `factoring_consultas_cpf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cpf` text NOT NULL,
	`dados` text DEFAULT '{}' NOT NULL,
	`criado_em` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factoring_consultas_cpf_cpf_unique` ON `factoring_consultas_cpf` (`cpf`);