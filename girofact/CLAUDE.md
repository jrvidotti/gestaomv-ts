# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar no app `girofact`.

## Comandos

### Desenvolvimento

- `yarn dev` - Inicia servidor de desenvolvimento na porta 3000
- `yarn build` - Constrói para produção
- `yarn serve` - Visualiza build de produção
- `yarn test` - Executa testes com Vitest

### Qualidade de Código

- `yarn lint` - Faz lint do código com Biome
- `yarn format` - Formata código com Biome
- `yarn typecheck` - Executa verificações de lint e formatação

### Banco de Dados

- `yarn db:generate` - Gera migrações do Drizzle
- `yarn db:migrate` - Executa migrações do banco de dados
- `yarn db:seed` - Popula banco de dados com dados de exemplo

### Componentes UI

- `npx shadcn@latest add <componente>`

## Arquitetura

### Stack Tecnológica

- **Framework**: TanStack Start com React 19
- **Roteamento**: TanStack Router (baseado em arquivos em `src/routes/`)
- **Gerenciamento de Estado**: TanStack Store
- **Busca de Dados**: TanStack Query + tRPC
- **Banco de Dados**: SQLite com Drizzle ORM
- **Estilização**: Tailwind CSS + componentes Shadcn
- **Linting/Formatação**: Biome
- **Testes**: Vitest + Testing Library

### Estrutura do Projeto

- **Arquitetura Modular**: Lógica de negócio organizada em `src/modules/` com estrutura consistente:
  - `enums/` - Enums e constantes para esquemas
  - `schemas/` - Definições de tabelas e relacionamentos do Drizzle
  - `dtos/` - Esquemas de validação de entrada/saída Zod
  - `types/` - Definições de tipos TypeScript
  - `services/` - Serviços de lógica de negócio
  - `routers/` - Rotas de API tRPC em `src/trpc/` com estrutura de roteador modular
- **Módulos**: `core`, `almoxarifado` (estoque), `rh` (recursos humanos)
- **Banco de Dados**: Esquemas centralizados em `src/db/schemas.ts` que re-exporta todos os esquemas dos módulos
- **Integração tRPC**: Rotas de API em `src/trpc/` com estrutura de roteador modular

### Padrões Principais

- Use aliases de caminho (`@/`) configurados em `vite-tsconfig-paths`
- Variáveis de ambiente gerenciadas com T3Env em `src/env.ts`
- Arquivos demo com prefixo `demo` podem ser deletados com segurança
- Banco de dados configurado para SQLite com migrações em `src/db/migrations/`
- Utilitários de importação/exportação em `src/lib/import-export/` para gerenciamento de dados

### Roteamento Baseado em Arquivos

Rotas em `src/routes/` são automaticamente gerenciadas pelo TanStack Router. O `__root.tsx` serve como wrapper de layout com `<Outlet />` para rotas aninhadas.

### Templates de Email

Templates Handlebars estão em `src/modules/core/services/templates/`:

- `welcome.hbs` - Email de boas-vindas
- `almoxarifado/` - Templates específicos do almoxarifado (solicitações)

## Integração tRPC

O projeto utiliza tRPC para comunicação type-safe entre frontend e backend. A estrutura está organizada da seguinte forma:

### Estrutura tRPC

```
src/trpc/
├── init.ts        # Configuração inicial do tRPC
├── react.ts       # Hooks React para uso no frontend
└── router.ts      # Router principal que combina todos os módulos
```

### Padrão de Uso no Frontend

**IMPORTANTE**: Use sempre o padrão `useTRPC` hook, não um objeto `api`.

#### Import Correto

```typescript
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
```

#### Queries

```typescript
function Component() {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.moduleName.methodName.queryOptions(params)
  );
}
```

#### Mutations

```typescript
function Component() {
  const trpc = useTRPC()

  const { mutate, isLoading } = useMutation({
    ...trpc.moduleName.methodName.mutationOptions(),
    onSuccess: () => {
      // Callback de sucesso
    },
    onError: (error) => {
      // Callback de erro
    }
  })

  // Usar a mutation
  const handleAction = () => {
    mutate({ id: 123, data: {...} })
  }
}
```

#### Exemplo Completo

```typescript
import { useTRPC } from '@/trpc/react'
import { useQuery, useMutation } from '@tanstack/react-query'

function UsersPage() {
  const trpc = useTRPC()

  // Query
  const { data: users, isLoading, refetch } = useQuery(
    trpc.core.users.findAll.queryOptions()
  )

  // Mutation
  const { mutate: updateUser } = useMutation({
    ...trpc.core.users.update.mutationOptions(),
    onSuccess: () => {
      refetch() // Recarregar dados após sucesso
    }
  })

  return (
    // JSX aqui
  )
}
```

### Routers por Módulo

Cada módulo define seus próprios routers em `src/modules/[module]/routers/`:

- `core` - Autenticação, usuários, empresas, unidades
- `almoxarifado` - Materiais, solicitações, estatísticas
- `rh` - Funcionários, equipes, avaliações

### Convenções

- **Não** use `api.method.useQuery()` (padrão antigo)
- **Use** `useQuery(trpc.method.queryOptions())` (padrão correto)
- Sempre combine tRPC com TanStack Query para cache e sincronização
- Organize métodos por módulo seguindo a estrutura de pastas
- Use Zod schemas nos DTOs para validação automática

## Documentação dos Endpoints tRPC

### Estrutura de Acesso

Os endpoints tRPC estão organizados hierarquicamente:

```typescript
// Módulo Core (raiz)
trpc.core.auth.*
trpc.core.configuracoes.*
trpc.core.superadmin.*
trpc.core.users.*
```

### Endpoints Disponíveis

#### **Módulo Core**

##### **Auth** (Autenticação)

- `login` _mutation_ - Login com email/senha (`publicProcedure`)
- `registrar` _mutation_ - Registro de usuário (`publicProcedure`)
- `buscarPerfil` _query_ - Perfil do usuário logado (`protectedProcedure`)
- `buscarUserRoles` _query_ - Buscar roles de usuário (`protectedProcedure`)
- `adicionarUserRole` _mutation_ - Adicionar role a usuário (`adminProcedure`)
- `removerUserRole` _mutation_ - Remover role de usuário (`adminProcedure`)
- `logout` _mutation_ - Logout do sistema (`protectedProcedure`)
- `mudarSenha` _mutation_ - Alterar senha (`protectedProcedure`)

##### **Configurações**

- `getConfiguracoesSistema` _query_ - Buscar configurações (`adminProcedure`)
- `updateConfiguracoesSistema` _mutation_ - Atualizar configurações (`adminProcedure`)
- `initializeDefaultSettings` _mutation_ - Inicializar configurações padrão (`adminProcedure`)

##### **Superadmin**

- `buscarStatsSistema` _query_ - Estatísticas do sistema (`superadminProcedure`)
- `buscarInfoSistema` _query_ - Informações do sistema (`superadminProcedure`)
- `buscarInfoMigracoes` _query_ - Informações de migração (`superadminProcedure`)
- `executarMigracoes` _mutation_ - Executar migrações (`superadminProcedure`)
- `operacaoSeed` _mutation_ - Operações de seed (`superadminProcedure`)
- `criarAdmin` _mutation_ - Criar usuário admin (`superadminProcedure`)

##### **Users** (Usuários)

- `listar` _query_ - Listar todos usuários (`adminProcedure`)
- `buscar` _query_ - Buscar usuário por ID (`adminProcedure`)
- `criar` _mutation_ - Criar novo usuário (`adminProcedure`)
- `atualizar` _mutation_ - Atualizar usuário (`adminProcedure`)
- `remover` _mutation_ - Remover usuário (`adminProcedure`)
- `buscarUsersPendentes` _query_ - Usuários pendentes de aprovação (`adminProcedure`)
- `buscarStatsUsuarios` _query_ - Estatísticas de usuários (`adminProcedure`)

### Permissões

- **`publicProcedure`**: Acesso público (não autenticado)
- **`protectedProcedure`**: Usuário autenticado
- **`adminProcedure`**: Administrador
- **`superadminProcedure`**: Super administrador

### Observações Importantes

- Todos os endpoints retornam dados tipados via Zod schemas
- Filtros de listagem incluem paginação (`pagina`, `limite`)
- Schemas de validação estão em `src/modules/[module]/dtos/`
