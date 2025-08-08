# Documentação do Projeto GestãoMV

## 1. Visão Geral

O GestãoMV é uma aplicação web full-stack moderna, construída com TypeScript, para gestão de recursos empresariais (ERP). O sistema é modular, permitindo a fácil expansão e manutenção de diferentes áreas do negócio, como Almoxarifado, RH, Checklist, entre outros.

A aplicação utiliza uma arquitetura integrada que combina frontend e backend no mesmo projeto, servida através do Vite com Server-Side Rendering (SSR) habilitado pelo TanStack Start.

## 2. Stack de Tecnologia

A seguir, a lista das principais tecnologias e bibliotecas utilizadas no projeto:

**Frontend:**
*   **Framework:** React 19
*   **Roteamento:** TanStack Router (com roteamento baseado em arquivos)
*   **Gerenciamento de Estado do Servidor:** TanStack Query
*   **Estilização:** Tailwind CSS com `tailwindcss-animate`
*   **Componentes de UI:** Radix UI (primitivos headless) e `lucide-react` (ícones)
*   **Formulários:** React Hook Form com Zod para validação
*   **Gráficos:** Recharts
*   **Notificações:** Sonner

**Backend & API:**
*   **Framework de API:** tRPC (para APIs full-stack type-safe)
*   **Validação de Schema:** Zod
*   **Autenticação:** JWT (JSON Web Tokens) com `jsonwebtoken` e `bcrypt`
*   **Servidor de Desenvolvimento/Build:** Vite com TanStack Start

**Banco de Dados:**
*   **ORM:** Drizzle ORM
*   **Dialeto:** SQLite
*   **Driver:** `better-sqlite3`
*   **Migrations:** `drizzle-kit`

**Ferramentas de Desenvolvimento (Tooling):**
*   **Build Tool:** Vite
*   **Linter/Formatter/Type-checker:** Biome
*   **Gerenciador de Pacotes:** Yarn (inferido pela presença de `yarn.lock`, embora os scripts usem `yarn`)
*   **Testes:** Vitest e React Testing Library
*   **Execução de Scripts TS:** `tsx`

## 3. Arquitetura

A arquitetura do GestãoMV foi projetada para ser robusta, escalável e fácil de manter.

### 3.1. Full-stack com Vite e TanStack Start

O projeto utiliza o plugin `@tanstack/react-start/plugin/vite`, que transforma o ambiente Vite em um servidor Node.js capaz de renderizar a aplicação no lado do servidor (SSR). Isso melhora o SEO e o tempo de carregamento inicial. O servidor de produção é iniciado com `node .output/server/index.mjs`.

### 3.2. Estrutura de Módulos (Backend)

A lógica de backend é organizada em **módulos** dentro de `src/modules`. Cada módulo (ex: `almoxarifado`, `rh`, `core`) agrupa seus próprios:
*   **Routers tRPC (`routers/`):** Define os endpoints da API.
*   **Schemas Zod (`schemas/`):** Define as estruturas de dados e validações.
*   **Serviços (`services/`):** Contém a lógica de negócio.
*   **Tipos (`types.ts`), Constantes (`consts.ts`) e Enums (`enums.ts`).**

O router principal do tRPC (`src/trpc/router.ts`) agrega todos os routers modulares.

### 3.3. API com tRPC

A comunicação entre o frontend e o backend é feita via tRPC. Isso elimina a necessidade de gerar e manter manualmente tipos de API, pois os tipos do backend são inferidos automaticamente no cliente, garantindo type-safety de ponta a ponta.

### 3.4. Roteamento Baseado em Arquivos

O TanStack Router é configurado para usar roteamento baseado em arquivos. As rotas da aplicação são definidas pela estrutura de arquivos e pastas dentro de `src/routes`. O arquivo `src/routeTree.gen.ts` é gerado automaticamente e não deve ser editado manualmente.

### 3.5. ORM com Drizzle

A interação com o banco de dados SQLite é gerenciada pelo Drizzle ORM.
*   **Schema:** Definido em `src/db/schemas.ts`.
*   **Migrations:** Gerenciadas pelo `drizzle-kit` e localizadas em `src/db/migrations`.
*   **Configuração:** `drizzle.config.ts`.

### 3.6. Componentes de UI

Os componentes da UI em `src/components` são construídos seguindo as melhores práticas:
*   **`src/components/ui`:** Componentes genéricos e reutilizáveis (Button, Card, Input, etc.), muitos deles baseados em primitivos do Radix UI.
*   **`src/components/[modulo]`:** Componentes específicos de um módulo ou funcionalidade.
*   **Estilização:** `tailwind-merge` e `clsx` são usados para aplicar estilos condicionais de forma limpa.

## 4. Estrutura de Diretórios Principal

```
/
├── data/                   # Arquivos de dados, incluindo o banco de dados SQLite.
├── public/                 # Arquivos estáticos.
├── scripts/                # Scripts de automação (ex: seed do banco).
├── src/
│   ├── components/         # Componentes React.
│   │   ├── ui/             # Componentes de UI genéricos.
│   │   └── [feature]/      # Componentes específicos de funcionalidades.
│   ├── constants/          # Constantes globais da aplicação.
│   ├── db/                 # Configuração do Drizzle, schema e migrações.
│   ├── hooks/              # Hooks React customizados.
│   ├── lib/                # Utilitários, helpers e configurações (auth, cookies).
│   ├── modules/            # Lógica de backend modular (tRPC routers, services, schemas).
│   │   ├── almoxarifado/
│   │   ├── core/
│   │   └── rh/
│   ├── providers/          # Provedores de contexto React (React Query, etc.).
│   ├── routes/             # Definição das rotas da aplicação (file-based routing).
│   ├── trpc/               # Configuração do cliente e servidor tRPC.
│   └── env.ts              # Validação de variáveis de ambiente com Zod.
├── drizzle.config.ts       # Configuração do Drizzle Kit.
├── package.json            # Dependências e scripts do projeto.
├── tsconfig.json           # Configuração do TypeScript.
└── vite.config.ts          # Configuração do Vite.
```

## 5. Como Começar (Guia do Desenvolvedor)

### 5.1. Pré-requisitos
*   Node.js (versão 20.x ou superior)
*   Yarn

### 5.2. Instalação
1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    yarn install
    ```

### 5.3. Configuração
1.  Crie um arquivo `.env` na raiz do projeto, copiando o `.env.example`.
2.  Preencha as variáveis de ambiente necessárias. A mais importante para iniciar é `DATABASE_PATH`.

### 5.4. Banco de Dados
1.  Para aplicar as migrações e criar o banco de dados:
    ```bash
    yarn db:migrate
    ```
2.  Para popular o banco de dados com dados iniciais (seeding):
    ```bash
    yarn db:seed
    ```

### 5.5. Rodando o Projeto
Para iniciar o servidor de desenvolvimento (com hot-reload):
```bash
yarn dev
```
A aplicação estará disponível em `http://localhost:3000`.

### 5.6. Outros Scripts Importantes

*   **Build para produção:**
    ```bash
    yarn build
    ```
*   **Iniciar servidor de produção:**
    ```bash
    yarn start
    ```
*   **Lint, Format e Type Check (Biome):**
    ```bash
    yarn lint      # Corrige erros de lint
    yarn format    # Formata o código
    yarn typecheck # Verifica os tipos do TypeScript
    ```
*   **Gerar nova migração do banco:**
    Após alterar o schema em `src/db/schemas.ts`:
    ```bash
    yarn db:generate
    ```

## 6. Convenções do Projeto

*   **Estilo de Código:** O projeto utiliza o Biome para formatação e linting. É altamente recomendável usar a extensão do Biome no seu editor para obter feedback em tempo real.
*   **Path Aliases:** Use o alias `@/*` para importar arquivos de dentro do diretório `src/`. Ex: `import { Button } from '@/components/ui/button';`.
*   **Variáveis de Ambiente:** Todas as variáveis de ambiente são validadas e expostas de forma type-safe através do arquivo `src/env.ts`, utilizando `@t3-oss/env-core`. Sempre acesse as variáveis de ambiente através do objeto `env` exportado por este arquivo.
