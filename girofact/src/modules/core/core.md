# Módulo Core

O módulo `core` é o coração da aplicação, responsável pelas funcionalidades centrais e pela administração do sistema. Ele gerencia entidades fundamentais como usuários, permissões, configurações globais e autenticação.

## Responsabilidades

- **Autenticação:** Gerencia o login, registro e sessões de usuários.
- **Gerenciamento de Usuários:** CRUD de usuários, atribuição de papéis (roles) e controle de status (ativo/inativo).
- **Gerenciamento de Permissões:** Define e controla os papéis (roles) e o que cada um pode acessar.
- **Configurações do Sistema:** Permite que administradores modifiquem parâmetros globais da aplicação, como permissões de registro e modo de manutenção.
- **Superadmin:** Fornece uma interface de superusuário para tarefas de baixo nível, como gerenciamento de migrações de banco de dados e operações de seed.
- **Notificações:** Centraliza o envio de e-mails transacionais, como boas-vindas a novos usuários e notificações para administradores.

---

## Estrutura de Arquivos

A lógica do módulo `core` é distribuída em três diretórios principais:

### 1. `@src/modules/core/**`

Contém toda a lógica de backend (servidor) do módulo.

- `module.ts`: Define os metadados do módulo, como título, rotas principais, papéis (roles) e itens de menu que aparecem na interface.
- `dtos/`: (Data Transfer Objects) Schemas Zod que validam os dados de entrada e saída das rotas da API.
- `routers/`: Define os endpoints da API usando tRPC. Cada arquivo corresponde a uma entidade ou funcionalidade (e.g., `auth.router.ts`, `users.router.ts`).
- `schemas/`: Define os schemas do banco de dados usando Drizzle ORM (e.g., `users.ts`, `settings.ts`).
- `services/`: Contém a lógica de negócio. Os serviços são chamados pelos routers e interagem com o banco de dados.
- `seed-configs/`: Configurações para popular o banco de dados com dados iniciais (seeding).

### 2. `@src/components/core/**`

Contém componentes React reutilizáveis que são específicos para as entidades do módulo `core`.

- `user-basic-form.tsx`: Formulário para criar e editar as informações básicas de um usuário.
- `empresa-form.tsx` e `unidade-form.tsx`: Embora `Empresa` e `Unidade` possam ser de outro módulo, seus formulários estão aqui, indicando uma forte relação com o núcleo do sistema.

### 3. `@src/routes/admin/core/**`

Contém as páginas (rotas) da interface de administração do módulo `core`.

- `index.tsx`: Dashboard principal da área de administração do `core`.
- `configuracoes.tsx`: Página para gerenciar as configurações globais do sistema.
- `users/`: Rotas para o CRUD de usuários (`index.tsx` para a lista, `novo.tsx` para criação e `$id/edit.tsx` para edição).
- `_me/`: Rotas para o perfil do usuário logado (`profile.tsx` e `alterar-senha.tsx`).

---

## Entidades Principais

### Usuários (`users`)

- **Schema:** `@src/modules/core/schemas/users.ts`
- **Gerenciamento:** A lógica de negócio está em `users.service.ts` e as rotas da API em `users.router.ts`.
- **Frontend:** As páginas de gerenciamento estão em `@src/routes/admin/core/users/**` e os formulários em `@src/components/core/user-basic-form.tsx`.

### Configurações (`settings`)

- **Schema:** `@src/modules/core/schemas/settings.ts`
- **Gerenciamento:** A lógica de negócio está em `configuracoes.service.ts` e as rotas da API em `configuracoes.router.ts`.
- **Frontend:** A página de gerenciamento está em `@src/routes/admin/core/configuracoes.tsx`.

---

## Fluxos Importantes

### Autenticação

1.  **Login:** O usuário insere email e senha.
2.  **Frontend:** A rota `_auth.login.tsx` captura os dados.
3.  **Backend:** A rota `auth.router.ts` (`login`) chama o `auth.service.ts`.
4.  **Serviço:** O `AuthService` valida as credenciais com o `UsersService` e, se corretas, gera um token JWT.
5.  **Resposta:** O token e os dados do usuário são retornados ao frontend, que os armazena para sessões futuras.

### Criação de Novo Usuário

1.  **Frontend:** O administrador acessa `/admin/core/users/novo`.
2.  **Componente:** O formulário `UserBasicForm` é usado para coletar nome, email e senha.
3.  **Backend:** A rota `users.router.ts` (`criar`) é chamada.
4.  **Serviço:** O `UsersService` cria o novo usuário no banco de dados, inicialmente sem nenhuma permissão (role).
5.  **Redirecionamento:** O administrador é redirecionado para a página de edição do novo usuário (`/admin/core/users/$id/edit`) para atribuir as permissões necessárias.

### Edição de Permissões de Usuário

1.  **Frontend:** O administrador acessa a página de edição de um usuário.
2.  **Componente:** O `UserRolesManager` exibe as permissões disponíveis e as que o usuário já possui.
3.  **Ação:** O administrador ativa ou desativa uma permissão.
4.  **Backend:** A rota `users.router.ts` (`atualizar`) é chamada, recebendo o array atualizado de `roles`.
5.  **Serviço:** O `UsersService` atualiza as permissões do usuário no banco de dados, limpando as antigas e inserindo as novas.
6.  **Notificação (Opcional):** Se o usuário estava pendente (sem permissões) e agora recebeu permissões, o `NotificationsService` pode ser acionado para enviar um e-mail de boas-vindas e aprovação.
