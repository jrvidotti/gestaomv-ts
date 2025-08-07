# Especificações Frontend - Módulo Core (Administração)

## Visão Geral
O módulo Core (Administração) é responsável pelo gerenciamento de usuários, empresas, unidades e configurações do sistema. Todas as telas seguem o padrão de layout administrativo (AdminLayout) com navegação lateral e proteção de rota.

## Estrutura de Rotas
```
/admin/core/
├── page.tsx                    # Dashboard principal
├── empresas/
│   ├── page.tsx               # Listagem de empresas
│   ├── nova/page.tsx          # Criar nova empresa
│   └── [id]/edit/page.tsx     # Editar empresa
├── unidades/
│   ├── page.tsx               # Listagem de unidades
│   ├── nova/page.tsx          # Criar nova unidade
│   └── [id]/edit/page.tsx     # Editar unidade
├── users/
│   ├── page.tsx               # Listagem de usuários
│   ├── novo/page.tsx          # Criar novo usuário
│   └── [id]/edit/page.tsx     # Editar usuário
└── configuracoes/
    └── page.tsx               # Configurações do sistema
```

## Telas Detalhadas

### 1. Dashboard Principal (`/admin/core/`)

**Objetivo:** Visão geral do sistema com estatísticas e ações rápidas.

**Componentes:**
- Header com título "Administração" e botão "Novo Usuário"
- Cards de estatísticas (4 cards em grid responsivo)
- Tabela de usuários pendentes (quando existem)
- Cards de ações rápidas (2 cards)
- Painel de status do sistema

**Estatísticas Exibidas:**
- Total de Usuários (ícone: Users)
- Usuários Ativos (ícone: UserCheck)  
- Pendentes de Aprovação (ícone: UserPlus)
- Usuários Inativos (ícone: Shield)

**Tabela de Usuários Pendentes:**
- Colunas: Usuário (avatar + nome), Email, Data de Criação, Ações
- Ação: Botão "Aprovar" que redireciona para edição do usuário
- Só aparece quando há usuários pendentes

**Cards de Ações Rápidas:**
- "Gerenciar Usuários" → `/admin/core/users`
- "Configurações" → `/admin/core/configuracoes`

**Painel de Status:**
- Status do sistema de usuários
- Alertas quando há usuários pendentes
- Status das configurações

**Dados tRPC:**
- `api.core.users.getUserStats.useQuery()` - Estatísticas
- `api.core.users.findPendingUsers.useQuery()` - Usuários pendentes

### 2. Listagem de Empresas (`/admin/core/empresas/`)

**Objetivo:** Visualizar e gerenciar todas as empresas cadastradas.

**Componentes:**
- Header com título "Gerenciamento de Empresas" e botão "Nova Empresa"
- Campo de busca (busca por razão social, nome fantasia ou CNPJ)
- Tabela com dados das empresas
- Menu dropdown de ações para cada empresa

**Funcionalidades de Busca:**
- Busca em tempo real
- Campos pesquisáveis: razão social, nome fantasia, CNPJ
- CNPJ aceita busca com ou sem formatação

**Tabela de Empresas:**
- Colunas: Empresa (razão social + CNPJ), Nome Fantasia, Unidades, Ações
- Linha clicável redireciona para edição
- Badge com quantidade de unidades vinculadas
- Menu dropdown com opções: Editar, Excluir

**Estados:**
- Loading: "Carregando empresas..."
- Erro: Mensagem de erro com detalhes
- Vazio: Lista vazia (sem empresas)

**Dados tRPC:**
- `api.core.empresas.findAll.useQuery()` - Lista todas empresas
- `api.core.empresas.remove.useMutation()` - Excluir empresa

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 3. Criar Nova Empresa (`/admin/core/empresas/nova/`)

**Objetivo:** Cadastrar nova empresa no sistema.

**Componentes:**
- Header com título "Nova Empresa", botão voltar e ações (Cancelar, Salvar)
- Formulário de empresa (componente `EmpresaForm`)

**Formulário:**
- Modo: "create"
- Validação: Schema `createEmpresaSchema`
- Campos obrigatórios e opcionais conforme schema
- Submit vinculado ao botão "Salvar" no header

**Fluxo:**
1. Usuário preenche formulário
2. Clica em "Salvar" (ou submit do form)
3. Após sucesso, redireciona para `/admin/core/empresas`
4. Exibe toast de sucesso/erro

**Dados tRPC:**
- `api.core.empresas.create.useMutation()` - Criar empresa

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 4. Editar Empresa (`/admin/core/empresas/[id]/edit/`)

**Objetivo:** Editar dados de empresa existente.

**Componentes:**
- Header com título "Editar Empresa", subtitle com razão social, botão voltar e ações
- Formulário de empresa pré-preenchido (componente `EmpresaForm`)
- Loading state enquanto carrega dados
- Error state se empresa não for encontrada

**Formulário:**
- Modo: "edit"
- Dados iniciais: Carregados via tRPC
- Validação: Schema `updateEmpresaSchema`
- Exibir informações de unidades vinculadas

**Estados:**
- Loading: "Carregando dados da empresa..."
- Erro: "Empresa não encontrada"
- Sucesso: Formulário com dados carregados

**Fluxo:**
1. Carrega dados da empresa
2. Pré-preenche formulário
3. Usuário edita e salva
4. Após sucesso, redireciona para `/admin/core/empresas`

**Dados tRPC:**
- `api.core.empresas.findOne.useQuery({ id })` - Buscar empresa
- `api.core.empresas.update.useMutation()` - Atualizar empresa

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 5. Listagem de Unidades (`/admin/core/unidades/`)

**Objetivo:** Visualizar e gerenciar todas as unidades cadastradas.

**Componentes:**
- Header com título "Gerenciamento de Unidades" e botão "Nova Unidade"
- Campo de busca (nome, código, cidade)
- Tabela com dados das unidades
- Menu dropdown de ações

**Funcionalidades de Busca:**
- Busca em tempo real
- Campos pesquisáveis: nome, código, cidade

**Tabela de Unidades:**
- Colunas: Nome (+ empresa), Código, PontoWeb ID, Ações
- Linha clicável redireciona para edição
- Badge para código da unidade
- Badge para PontoWeb ID (quando existir)
- Menu dropdown: Editar, Excluir

**Estados:**
- Loading: "Carregando unidades..."
- Erro: Mensagem de erro
- Dados: Lista de unidades

**Dados tRPC:**
- `api.core.unidades.findAll.useQuery()` - Lista todas unidades
- `api.core.unidades.remove.useMutation()` - Excluir unidade

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 6. Criar Nova Unidade (`/admin/core/unidades/nova/`)

**Objetivo:** Cadastrar nova unidade vinculada a uma empresa.

**Componentes:**
- Header com título "Nova Unidade", botão voltar e ações
- Formulário de unidade (componente `UnidadeForm`)

**Formulário:**
- Modo: "create"
- Lista de empresas carregada via tRPC
- Validação: Schema `createUnidadeSchema`
- Seletor de empresa obrigatório

**Dependências:**
- Carrega lista de empresas para seleção
- Desabilita formulário se empresas estão carregando

**Fluxo:**
1. Carrega empresas disponíveis
2. Usuário preenche formulário e seleciona empresa
3. Salva nova unidade
4. Redireciona para `/admin/core/unidades`

**Dados tRPC:**
- `api.core.empresas.findAll.useQuery()` - Lista empresas
- `api.core.unidades.create.useMutation()` - Criar unidade

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 7. Listagem de Usuários (`/admin/core/users/`)

**Objetivo:** Gerenciar todos os usuários do sistema.

**Componentes:**
- Header com título "Gerenciamento de Usuários" e botão "Novo Usuário"
- Campo de busca (nome, email)
- Tabela com dados dos usuários
- Menu dropdown de ações

**Funcionalidades de Busca:**
- Busca em tempo real por nome ou email

**Tabela de Usuários:**
- Colunas: Usuário (avatar + nome), Email, Função (badges de roles), Status, Data de Criação, Ações
- Avatar gerado automaticamente via Vercel
- Badges de roles com limite de exibição
- Badge de status (Ativo/Inativo)
- Menu dropdown: Editar, Ativar/Desativar, Excluir

**Gerenciamento de Status:**
- Toggle Ativar/Desativar usuário
- Confirmação para exclusão
- Estados de loading durante operações

**Estados:**
- Loading: "Carregando usuários..."
- Erro: Mensagem de erro
- Dados: Lista de usuários

**Dados tRPC:**
- `api.core.users.findAll.useQuery()` - Lista todos usuários
- `api.core.users.update.useMutation()` - Atualizar status
- `api.core.users.remove.useMutation()` - Excluir usuário

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 8. Criar Novo Usuário (`/admin/core/users/novo/`)

**Objetivo:** Criar novo usuário com dados básicos.

**Componentes:**
- Header com título "Novo Usuário", botão voltar e ações
- Formulário básico de usuário (componente `UserBasicForm`)

**Formulário:**
- Campos: Nome, Email, Senha, Status (Ativo/Inativo)
- Validação inline
- Usuário criado inicialmente sem roles

**Fluxo Especial:**
1. Cria usuário com dados básicos (sem roles)
2. Se sucesso e retorna ID, redireciona para edição para configurar roles
3. Se sucesso sem ID, redireciona para lista de usuários
4. Exibe toast de sucesso

**Dados tRPC:**
- `useUserForm({})` - Hook personalizado para criação

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 9. Editar Usuário (`/admin/core/users/[id]/edit/`)

**Objetivo:** Editar dados do usuário e gerenciar suas permissões.

**Componentes:**
- Header com título personalizado (nome do usuário)
- Layout em grid com 2 colunas:
  - Formulário básico do usuário
  - Gerenciador de roles

**Formulário Básico:**
- Componente `UserBasicForm`
- Dados pré-preenchidos
- Campos: Nome, Email, Status
- Modo de edição (sem campo senha)

**Gerenciador de Roles:**
- Componente `UserRolesManager`
- Checkboxes para cada role disponível
- Gerenciamento em tempo real das roles
- Sincronização com estado local

**Estados Complexos:**
- Loading: Skeleton completo da página
- Erro: Usuário não encontrado
- Dados: Formulários carregados

**Fluxo de Roles:**
1. Carrega usuário e suas roles atuais
2. Interface permite adicionar/remover roles
3. Mudanças ficam em estado local até salvar
4. Submit envia dados básicos + roles atualizadas

**Dados tRPC:**
- `useUserForm({ userId })` - Hook personalizado para edição
- Estado local para gerenciamento de roles

**Proteção:** Requer role `USER_ROLES.ADMIN`

### 10. Configurações do Sistema (`/admin/core/configuracoes/`)

**Objetivo:** Gerenciar configurações globais do sistema.

**Componentes:**
- Header com título "Configurações" e botão "Salvar Todas"
- 3 cards de configuração organizados por categoria
- Switches para cada configuração
- Estados de loading durante operações

**Card 1 - Configurações do Sistema:**
- Permitir registro de novos usuários
- Notificações por email
- Modo de manutenção

**Card 2 - Notificações de Novos Usuários:**
- Toggle para notificar criação de usuários
- Seleção de administradores que recebem notificações
- Lista de admins com toggles individuais
- Alerta quando nenhum admin selecionado

**Card 3 - Notificações de Aprovação:**
- Toggle para notificar usuários aprovados
- Explicação do funcionamento
- Card informativo verde quando ativo

**Gerenciamento de Estado:**
- Estado local sincronizado com servidor
- Mudanças em tempo real nos switches
- Parsing de IDs de administradores (string → array)
- Validação antes de salvar

**Fluxo:**
1. Carrega configurações atuais
2. Sincroniza com estado local
3. Usuário altera configurações
4. Clica "Salvar Todas"
5. Envia todas as configurações de uma vez

**Estados:**
- Loading: Skeleton cards
- Dados: Interface completa com switches

**Dados tRPC:**
- `api.core.configuracoes.getConfiguracoesSistema.useQuery()` - Buscar configs
- `api.core.users.findAll.useQuery()` - Lista usuários (para filtrar admins)
- `api.core.configuracoes.updateConfiguracoesSistema.useMutation()` - Salvar configs

**Proteção:** Requer role `USER_ROLES.ADMIN`

## Padrões de Interface

### Layout
- Todas as páginas usam `AdminLayout` com `PageHeader`
- Navegação consistente com breadcrumbs
- Botões de ação sempre no header

### Estados de Loading
- Skeleton components para loading
- Estados de erro padronizados
- Mensagens de feedback via toast

### Tabelas
- Componente `Table` do Shadcn/UI
- Busca em tempo real
- Menu dropdown para ações
- Linhas clicáveis para edição

### Formulários
- Validação com Zod schemas
- Componentes reutilizáveis
- Estados de submitting
- Feedback visual durante operações

### Proteção de Rotas
- `RouteGuard` com `requiredRoles`
- Redirecionamento automático se não autorizado
- Verificação de roles específicas

### Responsividade
- Grid responsivo para cards e tabelas
- Layout mobile-first
- Breakpoints: md (768px), lg (1024px)

## Dependências Principais

### Componentes UI (Shadcn/UI)
- Button, Card, Input, Table
- Badge, Avatar, Switch
- DropdownMenu, Skeleton
- Dialog para confirmações

### Ícones (Lucide React)
- Users, Settings, Building, Plus
- Edit, Trash2, MoreHorizontal
- UserCheck, UserX, Shield, Bell

### Hooks Personalizados
- `useUserForm` - Gerenciamento de usuários
- `useUserRoles` - Gerenciamento de roles
- Hooks tRPC específicos

### Validação
- Schemas Zod importados de `@/shared`
- Validação em runtime
- Tipos TypeScript inferidos

### Estado Global
- tRPC para queries e mutations
- Context de autenticação
- Utils para invalidação de cache

## Fluxos de Navegação

### Usuários
1. Dashboard → Lista Usuários → Criar/Editar
2. Usuários pendentes no dashboard → Editar diretamente
3. Novo usuário → Criar básico → Editar roles

### Empresas/Unidades
1. Lista → Criar/Editar
2. Editar empresa → Ver unidades vinculadas
3. Criar unidade → Selecionar empresa

### Configurações
1. Dashboard → Configurações
2. Configurações salvas → Reflexo imediato no sistema

Este documento serve como core completa para reimplementar o módulo de administração em qualquer framework frontend, mantendo a mesma estrutura, funcionalidades e experiência do usuário.