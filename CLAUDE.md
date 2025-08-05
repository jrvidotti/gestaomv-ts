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
- `yarn typecheck` - Executa verificações de lint e formatação

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

## Boas Práticas de Desenvolvimento

Utilize sempre que possível:

- **TanStack Query**: gerenciamento e sincronização de estado do servidor
- **React Hook Form** com **Zod**: construção e validação de formulários.
- **TanStack Store**: gerenciamento de estado
- **TanStack Table**: construção de tabelas complexas e personalizáveis
- **TanStack Router**: roteamento baseado em arquivos
- **Shadcn**: componentes de UI

## Avisos e Lembretes

- Não tente iniciar o servidor (yarn dev) a não ser que solicitado
- Ao utilizar componentes Select, nunca utilize vazio ou nulo como opções (utilize "all").

## Migration Notes

- O diretorio gestaomv-OLD possui um app NextJS que será migrado totalmente para gestaomv (app em Tanstack Start). O backend ja está migrado. Migre o frontend conforme solicitação do usuário. Em caso de dúvidas sobre alguma funcionalidade, veja como está implementado no pacote gestaomv-OLD.

## tRPC Migration Pattern

### ❌ Padrão INCORRETO (usado em gestaomv-OLD)

```typescript
// NUNCA use este padrão no novo sistema
import { api } from "@/lib/trpc";

// Uso incorreto:
const { data } = api.almoxarifado.listarMateriais.useQuery(filtros);
const mutation = api.almoxarifado.criarMaterial.useMutation();
```

### ✅ Padrão CORRETO (usar em gestaomv)

```typescript
// Use este padrão no novo sistema
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";

function Component() {
  const trpc = useTRPC();

  // Queries
  const { data, isLoading } = useQuery(
    trpc.almoxarifado.listarMateriais.queryOptions(filtros)
  );

  // Mutations
  const { mutate } = useMutation({
    ...trpc.almoxarifado.criarMaterial.mutationOptions(),
    onSuccess: () => {
      // sucesso
    },
  });
}
```

### Motivo da Diferença

O sistema antigo (NextJS) usava um wrapper `api` que encapsulava os hooks do tRPC diretamente. O novo sistema (TanStack Start) usa uma abordagem mais explícita onde:

1. `useTRPC()` retorna o cliente tRPC
2. `useQuery()` e `useMutation()` são usados explicitamente do TanStack Query
3. Métodos tRPC fornecem `queryOptions()` e `mutationOptions()` para integração

### Erros Comuns na Migração

1. **Erro**: `Cannot read properties of undefined (reading 'almoxarifado')`
   - **Causa**: Tentativa de usar `api.almoxarifado` que não existe
   - **Solução**: Usar `trpc = useTRPC()` e depois `trpc.almoxarifado`

2. **Erro**: Import não encontrado para `@/lib/trpc`
   - **Causa**: Caminho incorreto para tRPC no novo sistema
   - **Solução**: Usar `@/integrations/trpc/react`

3. **Erro**: `useQuery` não funciona com tRPC
   - **Causa**: Uso direto de hooks tRPC em vez de TanStack Query
   - **Solução**: Usar `queryOptions()` e `mutationOptions()`

4. **Erro**: Import de componentes não encontrado
   - **Causa**: Estrutura de pastas diferente entre sistemas
   - **Exemplos comuns**:
     - `@/components/ui/thumbnail` → `@/components/thumbnail`
     - `@/shared/schemas` → `@/modules/[module]/dtos`

### Template de Migração

Para migrar uma página que usa tRPC:

1. **Trocar imports**:

   ```diff
   - import { api } from '@/lib/trpc'
   + import { useTRPC } from '@/integrations/trpc/react'
   + import { useQuery, useMutation } from '@tanstack/react-query'
   ```

2. **Adicionar hook no componente**:

   ```diff
   function Component() {
   +  const trpc = useTRPC()
   ```

3. **Migrar queries**:

   ```diff
   - const { data } = api.module.method.useQuery(params)
   + const { data } = useQuery(trpc.module.method.queryOptions(params))
   ```

4. **Migrar mutations**:
   ```diff
   - const mutation = api.module.method.useMutation({ onSuccess: () => {} })
   + const { mutate } = useMutation({
   +   ...trpc.module.method.mutationOptions(),
   +   onSuccess: () => {}
   + })
   ```
