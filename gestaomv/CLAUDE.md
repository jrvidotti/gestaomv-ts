# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar no app `gestaomv` (@gestaomv/app).

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
  - `routers/` - Rotas de API tRPC em `src/integrations/trpc/` com estrutura de roteador modular
- **Módulos**: `core`, `almoxarifado` (estoque), `rh` (recursos humanos)
- **Banco de Dados**: Esquemas centralizados em `src/db/schemas.ts` que re-exporta todos os esquemas dos módulos
- **Integração tRPC**: Rotas de API em `src/integrations/trpc/` com estrutura de roteador modular

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
src/integrations/trpc/
├── init.ts        # Configuração inicial do tRPC
├── react.ts       # Hooks React para uso no frontend
└── router.ts      # Router principal que combina todos os módulos
```

### Padrão de Uso no Frontend

**IMPORTANTE**: Use sempre o padrão `useTRPC` hook, não um objeto `api`.

#### Import Correto

```typescript
import { useTRPC } from "@/integrations/trpc/react";
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
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery, useMutation } from '@tanstack/react-query'

function UsersPage() {
  const trpc = useTRPC()

  // Query
  const { data: users, isLoading, refetch } = useQuery(
    trpc.users.findAll.queryOptions()
  )

  // Mutation
  const { mutate: updateUser } = useMutation({
    ...trpc.users.update.mutationOptions(),
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
trpc.auth.*
trpc.configuracoes.*
trpc.empresas.*
trpc.superadmin.*
trpc.tagone.*
trpc.unidades.*
trpc.users.*

// Módulo RH
trpc.rh.departamentos.*
trpc.rh.equipes.*
trpc.rh.cargos.*
trpc.rh.funcionarios.*
trpc.rh.avaliacoesExperiencia.*
trpc.rh.avaliacoesPeriodicas.*
trpc.rh.pontoweb.*

// Módulo Almoxarifado
trpc.almoxarifado.materiais.*
trpc.almoxarifado.solicitacoes.*
trpc.almoxarifado.stats.*
```

### Endpoints Disponíveis

#### **Módulo Core**

##### **Auth** (Autenticação)
- `login` *mutation* - Login com email/senha (`publicProcedure`)
- `loginWithTagOne` *mutation* - Login via TagOne (`publicProcedure`)
- `register` *mutation* - Registro de usuário (`publicProcedure`)
- `profile` *query* - Perfil do usuário logado (`protectedProcedure`)
- `getUserRoles` *query* - Buscar roles de usuário (`protectedProcedure`)
- `addUserRole` *mutation* - Adicionar role a usuário (`adminProcedure`)
- `removeUserRole` *mutation* - Remover role de usuário (`adminProcedure`)
- `logout` *mutation* - Logout do sistema (`protectedProcedure`)
- `changePassword` *mutation* - Alterar senha (`protectedProcedure`)

##### **Configurações**
- `getConfiguracoesSistema` *query* - Buscar configurações (`adminProcedure`)
- `updateConfiguracoesSistema` *mutation* - Atualizar configurações (`adminProcedure`)
- `initializeDefaultSettings` *mutation* - Inicializar configurações padrão (`adminProcedure`)

##### **Empresas**
- `findAll` *query* - Listar todas empresas (`adminProcedure`)
- `findOne` *query* - Buscar empresa por ID (`adminProcedure`)
- `findByCnpj` *query* - Buscar empresa por CNPJ (`adminProcedure`)
- `findByPontowebId` *query* - Buscar empresa por ID do Pontoweb (`adminProcedure`)
- `create` *mutation* - Criar nova empresa (`adminProcedure`)
- `update` *mutation* - Atualizar empresa (`adminProcedure`)
- `remove` *mutation* - Remover empresa (`adminProcedure`)

##### **Superadmin**
- `getStats` *query* - Estatísticas do sistema (`superadminProcedure`)
- `getSystemInfo` *query* - Informações do sistema (`superadminProcedure`)
- `getMigrationInfo` *query* - Informações de migração (`superadminProcedure`)
- `runMigrations` *mutation* - Executar migrações (`superadminProcedure`)
- `seedOperation` *mutation* - Operações de seed (`superadminProcedure`)
- `createAdmin` *mutation* - Criar usuário admin (`superadminProcedure`)

##### **TagOne**
- `login` *mutation* - Login no TagOne (`protectedProcedure`)
- `getStatus` *query* - Status da integração TagOne (`protectedProcedure`)
- `logout` *mutation* - Logout do TagOne (`protectedProcedure`)
- `getUserTagOne` *query* - Dados TagOne do usuário (`protectedProcedure`)

##### **Unidades**
- `findAll` *query* - Listar todas unidades (`adminProcedure`)
- `findOne` *query* - Buscar unidade por ID (`adminProcedure`)
- `findByCodigo` *query* - Buscar unidade por código (`adminProcedure`)
- `findByEmpresa` *query* - Buscar unidades por empresa (`adminProcedure`)
- `create` *mutation* - Criar nova unidade (`adminProcedure`)
- `update` *mutation* - Atualizar unidade (`adminProcedure`)
- `remove` *mutation* - Remover unidade (`adminProcedure`)

##### **Users** (Usuários)
- `findAll` *query* - Listar todos usuários (`adminProcedure`)
- `findOne` *query* - Buscar usuário por ID (`adminProcedure`)
- `create` *mutation* - Criar novo usuário (`adminProcedure`)
- `update` *mutation* - Atualizar usuário (`adminProcedure`)
- `remove` *mutation* - Remover usuário (`adminProcedure`)
- `findPendingUsers` *query* - Usuários pendentes de aprovação (`adminProcedure`)
- `getUserStats` *query* - Estatísticas de usuários (`adminProcedure`)

#### **Módulo RH**

##### **Departamentos**
- `criar` *mutation* - Criar departamento (`adminProcedure`)
- `listar` *query* - Listar departamentos com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar departamento por ID (`protectedProcedure`)
- `atualizar` *mutation* - Atualizar departamento (`adminProcedure`)
- `deletar` *mutation* - Deletar departamento (`adminProcedure`)

##### **Equipes**
- `criar` *mutation* - Criar equipe (`adminProcedure`)
- `listar` *query* - Listar equipes com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar equipe por ID (`protectedProcedure`)
- `atualizar` *mutation* - Atualizar equipe (`adminProcedure`)
- `deletar` *mutation* - Deletar equipe (`adminProcedure`)
- `adicionarFuncionario` *mutation* - Adicionar funcionário à equipe (`adminProcedure`)
- `buscarFuncionarios` *query* - Funcionários da equipe (`protectedProcedure`)
- `buscarPorFuncionario` *query* - Equipes do funcionário (`protectedProcedure`)
- `definirLider` *mutation* - Definir líder da equipe (`adminProcedure`)
- `removerFuncionario` *mutation* - Remover funcionário da equipe (`adminProcedure`)

##### **Cargos**
- `criar` *mutation* - Criar cargo (`adminProcedure`)
- `listar` *query* - Listar cargos com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar cargo por ID (`protectedProcedure`)
- `buscarPorDepartamento` *query* - Cargos do departamento (`protectedProcedure`)
- `atualizar` *mutation* - Atualizar cargo (`adminProcedure`)
- `deletar` *mutation* - Deletar cargo (`adminProcedure`)

##### **Funcionários**
- `criar` *mutation* - Criar funcionário (`adminProcedure`)
- `listar` *query* - Listar funcionários com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar funcionário por ID (`protectedProcedure`)
- `buscarPorDepartamento` *query* - Funcionários do departamento (`protectedProcedure`)
- `buscarPorCargo` *query* - Funcionários do cargo (`protectedProcedure`)
- `atualizar` *mutation* - Atualizar funcionário (`adminProcedure`)
- `alterarStatus` *mutation* - Alterar status do funcionário (`adminProcedure`)
- `deletar` *mutation* - Deletar funcionário (`adminProcedure`)
- `criarUserFuncionario` *mutation* - Vincular usuário a funcionário (`adminProcedure`)
- `buscarPorUser` *query* - Funcionário vinculado ao usuário (`protectedProcedure`)
- `deletarUserFuncionario` *mutation* - Desvincular usuário de funcionário (`adminProcedure`)

##### **Avaliações de Experiência**
- `criar` *mutation* - Criar avaliação de experiência (`adminProcedure`)
- `listar` *query* - Listar avaliações com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar avaliação por ID (`protectedProcedure`)
- `buscarPorFuncionario` *query* - Avaliações do funcionário (`protectedProcedure`)

##### **Avaliações Periódicas**
- `criar` *mutation* - Criar avaliação periódica (`adminProcedure`)
- `listar` *query* - Listar avaliações com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar avaliação por ID (`protectedProcedure`)
- `buscarPorFuncionario` *query* - Avaliações do funcionário (`protectedProcedure`)

##### **Pontoweb**
- `importarFuncionarios` *mutation* - Importar funcionários do Pontoweb (`adminProcedure`)
- `sincronizarAfastamentos` *mutation* - Sincronizar afastamentos (`adminProcedure`)
- `obterMotivosDemissao` *query* - Motivos de demissão (`protectedProcedure`)

#### **Módulo Almoxarifado**

##### **Materiais**
- `criar` *mutation* - Criar material (`adminProcedure`)
- `listar` *query* - Listar materiais com filtros (`protectedProcedure`)
- `buscar` *query* - Buscar material por ID (`protectedProcedure`)
- `atualizar` *mutation* - Atualizar material (`adminProcedure`)
- `inativar` *mutation* - Inativar material (`adminProcedure`)
- `listarTiposMaterial` *query* - Tipos de material (`protectedProcedure`)
- `listarUnidadesMedida` *query* - Unidades de medida (`protectedProcedure`)
- `deletarFoto` *mutation* - Deletar foto do material (`adminProcedure`)

##### **Solicitações**
- `criar` *mutation* - Criar solicitação (`protectedProcedure`)
- `listar` *query* - Listar solicitações (filtradas por permissão) (`protectedProcedure`)
- `buscar` *query* - Buscar solicitação por ID (`protectedProcedure`)
- `aprovarOuRejeitar` *mutation* - Aprovar/rejeitar solicitação (`aprovadorProcedure`)
- `atender` *mutation* - Atender solicitação (`gestorAlmoxarifadoProcedure`)
- `cancelar` *mutation* - Cancelar solicitação (`protectedProcedure`)
- `atualizarQtdAtendidaAprovador` *mutation* - Atualizar qtd atendida (aprovador) (`aprovadorProcedure`)
- `atualizarQtdAtendidaGerente` *mutation* - Atualizar qtd atendida (gerente) (`gerenteAlmoxarifadoProcedure`)

##### **Stats** (Estatísticas)
- `obterEstatisticas` *query* - Estatísticas gerais (`protectedProcedure`)
- `obterTopMateriais` *query* - Materiais mais solicitados (`protectedProcedure`)
- `obterUsoPorTipo` *query* - Uso por tipo de material (`protectedProcedure`)
- `obterUsoPorUnidade` *query* - Uso por unidade (`protectedProcedure`)
- `obterConsumoSintetico` *query* - Relatório de consumo sintético (`protectedProcedure`)
- `obterConsumoAnalitico` *query* - Relatório de consumo analítico (`protectedProcedure`)

### Permissões

- **`publicProcedure`**: Acesso público (não autenticado)
- **`protectedProcedure`**: Usuário autenticado
- **`adminProcedure`**: Administrador
- **`superadminProcedure`**: Super administrador
- **`aprovadorProcedure`**: Admin ou Aprovador Almoxarifado
- **`gestorAlmoxarifadoProcedure`**: Admin, Aprovador ou Gerência Almoxarifado
- **`gerenteAlmoxarifadoProcedure`**: Apenas Gerência Almoxarifado

### Observações Importantes

- Todos os endpoints retornam dados tipados via Zod schemas
- Filtros de listagem incluem paginação (`pagina`, `limite`)
- Endpoints de listagem no módulo RH e Almoxarifado respeitam permissões específicas
- Solicitações são filtradas por permissão: usuários comuns veem apenas as próprias
- Schemas de validação estão em `src/modules/[module]/dtos/`
