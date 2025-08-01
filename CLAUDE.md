# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Idioma e Comunicação

- **SEMPRE** responda e se comunique em português brasileiro
- Use terminologia técnica apropriada em português quando possível
- Mantenha nomes de variáveis, funções e arquivos em inglês (padrão do código)
- Comentários em código devem ser em português brasileiro

## Comandos Principais

### Desenvolvimento

- `yarn dev` - Inicia servidor de desenvolvimento na porta 3000
- `yarn build` - Constrói aplicação para produção
- `yarn start` - Inicia servidor de produção
- `yarn test` - Executa testes com Vitest

### Qualidade de Código

- `yarn lint` - Executa lint do código com Biome
- `yarn format` - Formata código com Biome
- `yarn check` - Executa verificações de lint e formatação

### Banco de Dados

- `yarn db:generate` - Gera migrações do Drizzle
- `yarn db:migrate` - Executa migrações do banco de dados
- `yarn db:seed` - Popula banco de dados com dados de exemplo

### Monorepo

- `yarn build:packages` - Constrói todos os pacotes internos
- `yarn clean` - Limpa builds dos pacotes internos

## Arquitetura do Monorepo

### Estrutura

- **Workspace Root**: `/` - Configuração global do yarn workspaces
- **Aplicação Principal**: `/gestaomv/` - Aplicação TanStack Start
- **Pacotes Internos**: `/packages/` - Bibliotecas compartilhadas:
  - `@movelabs/api-direct-data` - Integração com API Direct Data
  - `@movelabs/pix-sicoob` - Integração PIX Sicoob
  - `@movelabs/pontoweb` - Integração Pontoweb
  - `@movelabs/tagone` - Integração TagOne

### Stack Tecnológica Principal

- **Framework**: TanStack Start com React 19
- **Roteamento**: TanStack Router (baseado em arquivos)
- **Gerenciamento de Estado**: TanStack Store
- **Busca de Dados**: TanStack Query + tRPC
- **Banco de Dados**: SQLite com Drizzle ORM
- **Estilização**: Tailwind CSS + componentes Shadcn
- **Linting/Formatação**: Biome
- **Testes**: Vitest + Testing Library

### Aplicativo principal - gestao

Siga as instruções do arquivo `gestaomv/CLAUDE.md` para desenvolver no aplicativo principal. Leia o arquivo `gestaomv/README.md` para mais informações.

### Pacotes Internos

Cada pacote em `/packages/` é uma biblioteca independente com:

- Configuração própria de build
- Tipos TypeScript específicos
- Integração com APIs externas específicas

### Desenvolvimento

1. **Setup inicial**: `yarn install` na raiz instala dependências de todos os workspaces
2. **Desenvolvimento local**: `yarn dev` executa a aplicação principal
3. **Build completo**: `yarn build:packages && yarn build` constrói pacotes e aplicação
4. **Banco de dados**: Execute `yarn db:migrate && yarn db:seed` para setup inicial
