# Como Criar um Novo Módulo

Este guia descreve o processo para criar um novo módulo na arquitetura da aplicação, usando o módulo `almoxarifado` como exemplo.

## Passo 1: Estrutura de Diretórios

Crie a estrutura de diretórios para o seu novo módulo dentro de `@src/modules`. A estrutura deve seguir o padrão do módulo `core`.

```
/src/modules/
└── nome-do-modulo/
    ├── module.ts
    ├── dtos/
    │   └── index.ts
    ├── routers/
    │   └── index.ts
    ├── schemas/
    │   └── index.ts
    └── services/
        └── index.ts
```

## Passo 2: Metadados do Módulo (`module.ts`)

Crie o arquivo `@src/modules/nome-do-modulo/module.ts`. Este arquivo define as informações principais do seu módulo.

**Exemplo (`@src/modules/almoxarifado/module.ts`):**

```typescript
import { MODULE_STATUS, type ModuleData } from "@/constants";
import { Archive } from "lucide-react";

// 1. Defina os papéis (roles) específicos do módulo
export const MODULE_ROLES = {
  SOLICITANTE: "almoxarifado_solicitante",
  APROVADOR: "almoxarifado_aprovador",
  GERENCIA: "almoxarifado_gerencia",
} as const;

// 2. Defina os metadados do módulo
export const MODULE_DATA: ModuleData = {
  module: "almoxarifado",
  title: "Almoxarifado",
  description: "Controle de estoque e solicitações de materiais",
  url: "/admin/almoxarifado",
  color: "bg-amber-500",
  status: MODULE_STATUS.ATIVO,
  icon: Archive,
  moduleRoles: MODULE_ROLES,
  moduleRolesData: {
    [MODULE_ROLES.SOLICITANTE]: { /* ... detalhes do papel ... */ },
    [MODULE_ROLES.APROVADOR]: { /* ... detalhes do papel ... */ },
    [MODULE_ROLES.GERENCIA]: { /* ... detalhes do papel ... */ },
  },
  items: [
    // Sub-itens do menu
    { title: "Dashboard", url: "/admin/almoxarifado", /* ... */ },
    { title: "Materiais", url: "/admin/almoxarifado/materiais", /* ... */ },
  ],
  // 3. Papéis que podem ver o módulo no menu
  roles: [MODULE_ROLES.SOLICITANTE, MODULE_ROLES.APROVADOR, MODULE_ROLES.GERENCIA],
} as const;
```

## Passo 3: Schemas do Banco de Dados (`schemas/`)

Defina as tabelas do seu módulo usando Drizzle ORM em `@src/modules/nome-do-modulo/schemas/`.

- Crie um arquivo para cada tabela (e.g., `materiais.ts`, `solicitacoes.ts`).
- Exporte todos os schemas no `index.ts`.

**Exemplo (`schemas/index.ts`):**

```typescript
export * from "./materiais";
export * from "./solicitacoes";
```

## Passo 4: DTOs e Validação (`dtos/`)

Crie os schemas de validação com Zod para as operações da sua API. Isso garante que os dados que entram e saem da sua API estejam corretos.

- Crie um arquivo para cada grupo de DTOs (e.g., `materiais.dto.ts`).
- Exporte tudo no `index.ts`.

## Passo 5: Lógica de Negócio (`services/`)

Implemente a lógica de negócio nos serviços. Os serviços são responsáveis por interagir com o banco de dados e executar as regras de negócio.

- Crie um serviço para cada entidade (e.g., `MateriaisService`).
- Instancie e exporte seus serviços no `index.ts`.

## Passo 6: Rotas da API (`routers/`)

Defina os endpoints da API usando tRPC. Os routers recebem as requisições, chamam os serviços apropriados e retornam as respostas.

- Crie um router para cada entidade (e.g., `materiais.router.ts`).
- Combine todos os routers do módulo em um `router` principal no `index.ts`.

**Exemplo (`routers/index.ts`):**

```typescript
import { materiaisRouter } from "./materiais.router";
import { solicitacoesRouter } from "./solicitacoes.router";

export const almoxarifadoRouter = {
  materiais: materiaisRouter,
  solicitacoes: solicitacoesRouter,
};
```

## Passo 7: Integração Global

Depois de criar o módulo, você precisa integrá-lo ao restante da aplicação.

1.  **Registrar Papéis (Roles):**
    - Vá para `@/constants/index.ts`.
    - Importe os `MODULE_ROLES` do seu módulo.
    - Adicione-os ao objeto `ALL_ROLES` e ao array `USER_ROLES_ARRAY`.
    - Adicione os metadados dos papéis (`moduleRolesData`) ao `ALL_ROLES_DATA`.

2.  **Registrar Módulo:**
    - Vá para `@/constants/modules.ts`.
    - Importe o `MODULE_DATA` do seu módulo.
    - Adicione-o ao array `modules`.

3.  **Registrar Rotas da API:**
    - Vá para `@/trpc/router.ts`.
    - Importe o router principal do seu módulo (e.g., `almoxarifadoRouter`).
    - Adicione-o ao `appRouter`.

4.  **Registrar Schemas do Banco:**
    - Vá para `@/db/schemas.ts`.
    - Adicione um `export * from "@/modules/nome-do-modulo/schemas";`.

## Passo 8: Criar Migração do Banco

Após adicionar os novos schemas, gere uma nova migração do banco de dados para criar as tabelas.

Execute o comando de migração do Drizzle:

```bash
npm run db:generate
```

## Passo 9: Criar Componentes e Páginas

Com a lógica de backend pronta, crie os componentes e as páginas no frontend para interagir com seu novo módulo.

- **Componentes:** Crie componentes reutilizáveis em `@/components/nome-do-modulo/`.
- **Páginas:** Crie as rotas (páginas) em `@/routes/admin/nome-do-modulo/` seguindo a estrutura de arquivos do TanStack Router.
