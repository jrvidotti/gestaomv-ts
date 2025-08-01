# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Idioma e Comunicação

- **SEMPRE** responda e se comunique em português brasileiro
- Use terminologia técnica apropriada em português quando possível
- Mantenha nomes de variáveis, funções e arquivos em inglês (padrão do código)
- Comentários em código devem ser em português brasileiro

## Comandos

### Desenvolvimento

- `yarn dev` - Inicia servidor de desenvolvimento na porta 3000
- `yarn build` - Constrói para produção
- `yarn serve` - Visualiza build de produção
- `yarn test` - Executa testes com Vitest

### Qualidade de Código

- `yarn lint` - Faz lint do código com Biome
- `yarn format` - Formata código com Biome
- `yarn check` - Executa verificações de lint e formatação

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
