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
- `loginWithTagOne` _mutation_ - Login via TagOne (`publicProcedure`)
- `register` _mutation_ - Registro de usuário (`publicProcedure`)
- `profile` _query_ - Perfil do usuário logado (`protectedProcedure`)
- `getUserRoles` _query_ - Buscar roles de usuário (`protectedProcedure`)
- `addUserRole` _mutation_ - Adicionar role a usuário (`adminProcedure`)
- `removeUserRole` _mutation_ - Remover role de usuário (`adminProcedure`)
- `logout` _mutation_ - Logout do sistema (`protectedProcedure`)
- `changePassword` _mutation_ - Alterar senha (`protectedProcedure`)

##### **Configurações**

- `getConfiguracoesSistema` _query_ - Buscar configurações (`adminProcedure`)
- `updateConfiguracoesSistema` _mutation_ - Atualizar configurações (`adminProcedure`)
- `initializeDefaultSettings` _mutation_ - Inicializar configurações padrão (`adminProcedure`)

##### **Empresas**

- `findAll` _query_ - Listar todas empresas (`adminProcedure`)
- `findOne` _query_ - Buscar empresa por ID (`adminProcedure`)
- `findByCnpj` _query_ - Buscar empresa por CNPJ (`adminProcedure`)
- `findByPontowebId` _query_ - Buscar empresa por ID do Pontoweb (`adminProcedure`)
- `create` _mutation_ - Criar nova empresa (`adminProcedure`)
- `update` _mutation_ - Atualizar empresa (`adminProcedure`)
- `remove` _mutation_ - Remover empresa (`adminProcedure`)

##### **Superadmin**

- `getStats` _query_ - Estatísticas do sistema (`superadminProcedure`)
- `getSystemInfo` _query_ - Informações do sistema (`superadminProcedure`)
- `getMigrationInfo` _query_ - Informações de migração (`superadminProcedure`)
- `runMigrations` _mutation_ - Executar migrações (`superadminProcedure`)
- `seedOperation` _mutation_ - Operações de seed (`superadminProcedure`)
- `createAdmin` _mutation_ - Criar usuário admin (`superadminProcedure`)

##### **TagOne**

- `login` _mutation_ - Login no TagOne (`protectedProcedure`)
- `getStatus` _query_ - Status da integração TagOne (`protectedProcedure`)
- `logout` _mutation_ - Logout do TagOne (`protectedProcedure`)
- `getUserTagOne` _query_ - Dados TagOne do usuário (`protectedProcedure`)

##### **Unidades**

- `findAll` _query_ - Listar todas unidades (`adminProcedure`)
- `findOne` _query_ - Buscar unidade por ID (`adminProcedure`)
- `findByCodigo` _query_ - Buscar unidade por código (`adminProcedure`)
- `findByEmpresa` _query_ - Buscar unidades por empresa (`adminProcedure`)
- `create` _mutation_ - Criar nova unidade (`adminProcedure`)
- `update` _mutation_ - Atualizar unidade (`adminProcedure`)
- `remove` _mutation_ - Remover unidade (`adminProcedure`)

##### **Users** (Usuários)

- `findAll` _query_ - Listar todos usuários (`adminProcedure`)
- `findOne` _query_ - Buscar usuário por ID (`adminProcedure`)
- `create` _mutation_ - Criar novo usuário (`adminProcedure`)
- `update` _mutation_ - Atualizar usuário (`adminProcedure`)
- `remove` _mutation_ - Remover usuário (`adminProcedure`)
- `findPendingUsers` _query_ - Usuários pendentes de aprovação (`adminProcedure`)
- `getUserStats` _query_ - Estatísticas de usuários (`adminProcedure`)

#### **Módulo RH**

##### **Departamentos**

- `criar` _mutation_ - Criar departamento (`adminProcedure`)
- `listar` _query_ - Listar departamentos com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar departamento por ID (`protectedProcedure`)
- `atualizar` _mutation_ - Atualizar departamento (`adminProcedure`)
- `deletar` _mutation_ - Deletar departamento (`adminProcedure`)

##### **Equipes**

- `criar` _mutation_ - Criar equipe (`adminProcedure`)
- `listar` _query_ - Listar equipes com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar equipe por ID (`protectedProcedure`)
- `atualizar` _mutation_ - Atualizar equipe (`adminProcedure`)
- `deletar` _mutation_ - Deletar equipe (`adminProcedure`)
- `adicionarFuncionario` _mutation_ - Adicionar funcionário à equipe (`adminProcedure`)
- `buscarFuncionarios` _query_ - Funcionários da equipe (`protectedProcedure`)
- `buscarPorFuncionario` _query_ - Equipes do funcionário (`protectedProcedure`)
- `definirLider` _mutation_ - Definir líder da equipe (`adminProcedure`)
- `removerFuncionario` _mutation_ - Remover funcionário da equipe (`adminProcedure`)

##### **Cargos**

- `criar` _mutation_ - Criar cargo (`adminProcedure`)
- `listar` _query_ - Listar cargos com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar cargo por ID (`protectedProcedure`)
- `buscarPorDepartamento` _query_ - Cargos do departamento (`protectedProcedure`)
- `atualizar` _mutation_ - Atualizar cargo (`adminProcedure`)
- `deletar` _mutation_ - Deletar cargo (`adminProcedure`)

##### **Funcionários**

- `criar` _mutation_ - Criar funcionário (`adminProcedure`)
- `listar` _query_ - Listar funcionários com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar funcionário por ID (`protectedProcedure`)
- `buscarPorDepartamento` _query_ - Funcionários do departamento (`protectedProcedure`)
- `buscarPorCargo` _query_ - Funcionários do cargo (`protectedProcedure`)
- `atualizar` _mutation_ - Atualizar funcionário (`adminProcedure`)
- `alterarStatus` _mutation_ - Alterar status do funcionário (`adminProcedure`)
- `deletar` _mutation_ - Deletar funcionário (`adminProcedure`)
- `criarUserFuncionario` _mutation_ - Vincular usuário a funcionário (`adminProcedure`)
- `buscarPorUser` _query_ - Funcionário vinculado ao usuário (`protectedProcedure`)
- `deletarUserFuncionario` _mutation_ - Desvincular usuário de funcionário (`adminProcedure`)

##### **Avaliações de Experiência**

- `criar` _mutation_ - Criar avaliação de experiência (`adminProcedure`)
- `listar` _query_ - Listar avaliações com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar avaliação por ID (`protectedProcedure`)
- `buscarPorFuncionario` _query_ - Avaliações do funcionário (`protectedProcedure`)

##### **Avaliações Periódicas**

- `criar` _mutation_ - Criar avaliação periódica (`adminProcedure`)
- `listar` _query_ - Listar avaliações com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar avaliação por ID (`protectedProcedure`)
- `buscarPorFuncionario` _query_ - Avaliações do funcionário (`protectedProcedure`)

##### **Pontoweb**

- `importarFuncionarios` _mutation_ - Importar funcionários do Pontoweb (`adminProcedure`)
- `sincronizarAfastamentos` _mutation_ - Sincronizar afastamentos (`adminProcedure`)
- `obterMotivosDemissao` _query_ - Motivos de demissão (`protectedProcedure`)

#### **Módulo Almoxarifado**

##### **Materiais**

- `criar` _mutation_ - Criar material (`adminProcedure`)
- `listar` _query_ - Listar materiais com filtros (`protectedProcedure`)
- `buscar` _query_ - Buscar material por ID (`protectedProcedure`)
- `atualizar` _mutation_ - Atualizar material (`adminProcedure`)
- `inativar` _mutation_ - Inativar material (`adminProcedure`)
- `listarTiposMaterial` _query_ - Tipos de material (`protectedProcedure`)
- `listarUnidadesMedida` _query_ - Unidades de medida (`protectedProcedure`)
- `deletarFoto` _mutation_ - Deletar foto do material (`adminProcedure`)

##### **Solicitações**

- `criar` _mutation_ - Criar solicitação (`protectedProcedure`)
- `listar` _query_ - Listar solicitações (filtradas por permissão) (`protectedProcedure`)
- `buscar` _query_ - Buscar solicitação por ID (`protectedProcedure`)
- `aprovarOuRejeitar` _mutation_ - Aprovar/rejeitar solicitação (`aprovadorProcedure`)
- `atender` _mutation_ - Atender solicitação (`gestorAlmoxarifadoProcedure`)
- `cancelar` _mutation_ - Cancelar solicitação (`protectedProcedure`)
- `atualizarQtdAtendidaAprovador` _mutation_ - Atualizar qtd atendida (aprovador) (`aprovadorProcedure`)
- `atualizarQtdAtendidaGerente` _mutation_ - Atualizar qtd atendida (gerente) (`gerenteAlmoxarifadoProcedure`)

##### **Stats** (Estatísticas)

- `obterEstatisticas` _query_ - Estatísticas gerais (`protectedProcedure`)
- `obterTopMateriais` _query_ - Materiais mais solicitados (`protectedProcedure`)
- `obterUsoPorTipo` _query_ - Uso por tipo de material (`protectedProcedure`)
- `obterUsoPorUnidade` _query_ - Uso por unidade (`protectedProcedure`)
- `obterConsumoSintetico` _query_ - Relatório de consumo sintético (`protectedProcedure`)
- `obterConsumoAnalitico` _query_ - Relatório de consumo analítico (`protectedProcedure`)

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
