# Documentação do Módulo Core

O módulo `core` é o coração do sistema, responsável pelas funcionalidades essenciais de administração, autenticação, gerenciamento de usuários, empresas, unidades e configurações gerais do sistema.

## Estrutura de Arquivos

A estrutura do módulo `core` é organizada da seguinte forma:

-   `dtos/`: Contém os _Data Transfer Objects_ (DTOs) e schemas de validação (Zod) para as entradas e saídas das rotas tRPC.
-   `routers/`: Define os endpoints da API utilizando tRPC. Cada arquivo corresponde a um agrupamento de rotas relacionadas (ex: `auth.router.ts`, `users.router.ts`).
-   `schemas/`: Define os schemas do banco de dados utilizando Drizzle ORM. Cada arquivo representa uma ou mais tabelas do banco de dados.
-   `services/`: Contém a lógica de negócio do módulo. Os serviços são responsáveis por interagir com o banco de dados e executar as regras de negócio.
-   `types.ts`: Define os tipos TypeScript utilizados em todo o módulo, muitos deles inferidos a partir dos schemas do Drizzle.
-   `module.ts`: Arquivo de definição do módulo, contendo metadados como título, descrição, rotas de navegação e permissões.

---

## Schemas do Banco de Dados (`schemas/`)

O módulo `core` define as seguintes tabelas principais:

-   **`users`**: Armazena as informações dos usuários do sistema, como email, senha (hash), nome e status.
-   **`user_roles`**: Tabela de associação que vincula os usuários às suas permissões (`roles`).
-   **`user_tagone`**: Armazena informações de integração com o sistema TagOne para um usuário específico.
-   **`empresas`**: Cadastro das empresas.
-   **`unidades`**: Cadastro das unidades de negócio, que podem ser associadas a uma empresa.
-   **`settings`**: Armazena configurações dinâmicas do sistema no formato chave-valor.
-   **`consultas_cpf`**: Log de consultas de CPF realizadas.

---

## Serviços (`services/`)

Os serviços encapsulam a lógica de negócio e a interação com a base de dados.

-   **`auth.service.ts`**:
    -   Responsável pela lógica de autenticação.
    -   Valida credenciais de usuários (`validateUser`).
    -   Gera tokens de acesso JWT (`generateAccessToken`).
    -   Orquestra o processo de login via email (`login`) e via TagOne (`loginWithTagOne`).
    -   Gerencia o registro de novos usuários (`register`).
    -   Gerencia a atribuição e remoção de `roles` de usuários.

-   **`users.service.ts`**:
    -   Fornece métodos CRUD (Create, Read, Update, Delete) para a entidade `User`.
    -   Realiza a busca de usuários por diversos critérios (ID, email, roles).
    -   Gerencia a troca de senhas (`changePassword`).
    -   Busca usuários pendentes de aprovação (`findPendingUsers`).

-   **`empresas.service.ts`**:
    -   Fornece métodos CRUD para a entidade `Empresa`.
    -   Permite a busca de empresas por CNPJ ou ID do Pontoweb.

-   **`unidades.service.ts`**:
    -   Fornece métodos CRUD para a entidade `Unidade`.
    -   Permite a busca de unidades por código, empresa ou ID do Pontoweb.

-   **`configuracoes.service.ts`**:
    -   Gerencia as configurações do sistema armazenadas na tabela `settings`.
    -   Permite obter e atualizar configurações de forma segura e centralizada.

-   **`superadmin.service.ts`**:
    -   Contém lógicas acessíveis apenas por `superadmin`.
    -   Obtém estatísticas e informações do sistema (`getSystemStats`, `getSystemInfo`).
    -   Gerencia as migrações do banco de dados (`getMigrationInfo`, `runMigrations`).
    -   Executa operações de importação/exportação de dados (seeding) (`seedOperation`).
    -   Permite a criação de novos administradores (`createAdmin`).

-   **`tagone.service.ts`**:
    -   Abstrai a comunicação com a API do sistema TagOne.
    -   Realiza login e validação de sessão no TagOne.
    -   Salva e recupera o estado da conexão com o TagOne para os usuários.

-   **`email.service.ts`**:
    -   Serviço para envio de emails transacionais utilizando Resend.
    -   Utilizado para enviar emails de boas-vindas e outras notificações.

-   **`notifications.service.ts`**:
    -   Orquestra o envio de notificações para eventos do sistema.
    -   Exemplos: notificar administradores sobre novos usuários, notificar usuários sobre aprovação de cadastro, etc.

-   **`storage.service.ts`**:
    -   Serviço para manipulação de arquivos em um provedor de armazenamento S3-compatível (como Minio ou AWS S3).
    -   Realiza upload, download e exclusão de arquivos.

-   **`template.service.ts`**:
    -   Responsável por renderizar templates de email (Handlebars).
    -   Permite a criação de emails HTML dinâmicos e padronizados.

---

## Endpoints tRPC (`routers/`)

Os endpoints são agrupados por contexto em diferentes roteadores.

### `auth.router.ts`

-   `login` (mutation): Autentica um usuário com email e senha.
-   `loginWithTagOne` (mutation): Autentica um usuário usando credenciais do TagOne.
-   `register` (mutation): Registra um novo usuário.
-   `profile` (query): Retorna o perfil do usuário autenticado.
-   `getUserRoles` (query): Retorna as `roles` de um usuário específico.
-   `addUserRole` (mutation): Adiciona uma `role` a um usuário.
-   `removeUserRole` (mutation): Remove uma `role` de um usuário.
-   `logout` (mutation): Invalida a sessão do usuário (atualmente simbólico).
-   `changePassword` (mutation): Permite que o usuário autenticado altere sua própria senha.

### `users.router.ts`

-   `findAll` (query): Lista todos os usuários.
-   `findOne` (query): Busca um usuário por ID.
-   `create` (mutation): Cria um novo usuário.
-   `update` (mutation): Atualiza os dados de um usuário.
-   `remove` (mutation): Remove um usuário.
-   `findPendingUsers` (query): Lista usuários que estão ativos mas ainda não possuem `roles`.
-   `getUserStats` (query): Retorna estatísticas sobre os usuários (total, ativos, pendentes).

### `empresas.router.ts`

-   `findAll` (query): Lista todas as empresas.
-   `findOne` (query): Busca uma empresa por ID.
-   `findByCnpj` (query): Busca uma empresa pelo CNPJ.
-   `create` (mutation): Cria uma nova empresa.
-   `update` (mutation): Atualiza os dados de uma empresa.
-   `remove` (mutation): Remove uma empresa.

### `unidades.router.ts`

-   `findAll` (query): Lista todas as unidades.
-   `findOne` (query): Busca uma unidade por ID.
-   `findByCodigo` (query): Busca uma unidade pelo seu código.
-   `findByEmpresa` (query): Lista todas as unidades de uma determinada empresa.
-   `create` (mutation): Cria uma nova unidade.
-   `update` (mutation): Atualiza os dados de uma unidade.
-   `remove` (mutation): Remove uma unidade.

### `configuracoes.router.ts`

-   `getConfiguracoesSistema` (query): Retorna o objeto com as configurações atuais do sistema.
-   `updateConfiguracoesSistema` (mutation): Atualiza uma ou mais configurações do sistema.
-   `initializeDefaultSettings` (mutation): Popula o banco com as configurações padrão caso não existam.

### `superadmin.router.ts`

-   `getStats` (query): Retorna estatísticas agregadas de várias partes do sistema.
-   `getSystemInfo` (query): Retorna informações sobre o ambiente de execução (versão, Node.js, banco de dados).
-   `getMigrationInfo` (query): Retorna o status das migrações do banco de dados.
-   `runMigrations` (mutation): Executa as migrações pendentes do banco de dados.
-   `seedOperation` (mutation): Executa operações de importação ou exportação de dados.
-   `createAdmin` (mutation): Cria um novo usuário com a `role` de "admin".

### `tagone.router.ts`

-   `login` (mutation): Conecta a conta do usuário logado a uma conta TagOne.
-   `getStatus` (query): Verifica o status da conexão com o TagOne para o usuário logado.
-   `logout` (mutation): Desconecta a conta do usuário do TagOne.
-   `getUserTagOne` (query): Retorna os dados da conexão TagOne do usuário.
