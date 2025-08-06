# Módulo Checklist

O módulo Checklist é um sistema completo de avaliação baseado em formulários configuráveis, permitindo criar templates de checklist e realizar avaliações periódicas das unidades.

## Visão Geral

O sistema permite:
- **Templates de Checklist**: Criar formulários de avaliação personalizados com diferentes tipos de perguntas
- **Avaliações**: Realizar avaliações baseadas nos templates configurados
- **Relatórios**: Gerar relatórios detalhados e comparativos entre unidades
- **Classificação Automática**: Sistema de pontuação automática baseado em pesos

## Estrutura do Módulo

```
src/modules/checklist/
├── dtos/              # Esquemas de validação Zod
│   ├── templates.ts   # Validações para templates
│   ├── avaliacoes.ts  # Validações para avaliações
│   └── index.ts
├── enums/            # Enumerações e constantes
│   ├── index.ts
│   └── ...
├── routers/          # Endpoints tRPC
│   ├── templates.router.ts
│   ├── avaliacoes.router.ts
│   └── index.ts
├── schemas/          # Esquemas de banco Drizzle
│   ├── templates.ts
│   ├── avaliacoes.ts
│   └── index.ts
├── services/         # Lógica de negócio
│   ├── templates.service.ts
│   └── avaliacoes.service.ts
├── types.ts          # Tipos TypeScript
├── module.ts         # Configuração do módulo
└── CLAUDE.md         # Esta documentação
```

## Enums e Constantes

### Tipos de Item (`tipoItemChecklistEnum`)
- `"NOTA_1_5"` - Avaliação com nota de 1 a 5
- `"SIM_NAO"` - Resposta Sim/Não (booleano)  
- `"texto"` - Campo de texto livre

### Status das Avaliações (`statusAvaliacaoEnum`)
- `"PENDENTE"` - Avaliação criada mas não iniciada
- `"EM_ANDAMENTO"` - Avaliação sendo preenchida
- `"CONCLUIDA"` - Avaliação finalizada com nota calculada
- `"CANCELADA"` - Avaliação cancelada

### Periodicidade (`periodicidadeEnum`)
- `"SEMANAL"`, `"QUINZENAL"`, `"MENSAL"`
- `"BIMESTRAL"`, `"TRIMESTRAL"`, `"SEMESTRAL"`
- `"ANUAL"`, `"UNICA"` (avaliação única/pontual)

### Classificação das Notas (`classificacaoNotaEnum`)
- `"EXCELENTE"` - 4.5 a 5.0
- `"BOM"` - 3.5 a 4.4
- `"REGULAR"` - 2.5 a 3.4
- `"RUIM"` - 1.5 a 2.4
- `"PESSIMO"` - 1.0 a 1.4

## Esquemas de Banco de Dados

### checklistTemplates
```sql
- id (integer, primary key)
- nome (text, not null) - Nome do template
- descricao (text) - Descrição opcional
- periodicidade (enum) - Frequência das avaliações
- ativo (boolean) - Se o template está ativo
- criadoPorId (integer) - FK para users.id
- criadoEm, atualizadoEm (timestamp)
```

### checklistItems
```sql
- id (integer, primary key)
- templateId (integer, FK) - Referência ao template
- titulo (text, not null) - Título da pergunta
- descricao (text) - Descrição detalhada
- tipo (enum) - Tipo de resposta esperada
- obrigatorio (boolean) - Se é obrigatório responder
- peso (real) - Peso para cálculo da média (padrão: 1.0)
- ordem (integer) - Ordem de exibição
- ativo (boolean) - Se o item está ativo
```

### checklistAvaliacoes
```sql
- id (integer, primary key)
- templateId (integer, FK) - Template usado
- unidadeId (integer, FK) - Unidade avaliada
- avaliadorId (integer, FK) - Usuário que fez a avaliação
- status (enum) - Status atual da avaliação
- dataAgendada, dataInicio, dataFim (datetime)
- mediaFinal (real) - Nota calculada automaticamente
- classificacao (enum) - Classificação baseada na nota
- observacoes (text) - Observações gerais
```

### checklistRespostas
```sql
- id (integer, primary key)
- avaliacaoId (integer, FK) - Avaliação relacionada
- itemId (integer, FK) - Item respondido
- valorNota (integer) - Nota de 1 a 5 (para tipo "nota_1_5")
- valorBoolean (boolean) - Resposta sim/não (para tipo "sim_nao")
- valorTexto (text) - Resposta texto (para tipo "texto")
- observacao (text) - Observação específica do item
```

## Endpoints tRPC

### Templates (`trpc.checklist.templates.*`)

#### Queries
- **`listar`** - Lista templates com filtros
  - Input: `{ nome?, ativo?, periodicidade?, pagina?, limite? }`
  - Output: Lista paginada com contadores de itens e avaliações
  - Permissão: `protectedProcedure`

- **`buscar`** - Busca template por ID
  - Input: `{ id }`
  - Output: Template com itens opcionais
  - Permissão: `protectedProcedure`

#### Mutations
- **`criar`** - Cria novo template com itens
  - Input: `{ nome, descricao?, periodicidade, ativo, itens[] }`
  - Output: Template criado
  - Permissão: `adminProcedure`

- **`atualizar`** - Atualiza template existente
  - Input: `{ id, ...dadosTemplate }`
  - Output: Template atualizado
  - Permissão: `adminProcedure`

- **`deletar`** - Inativa template (soft delete)
  - Input: `{ id }`
  - Output: `{ success: boolean }`
  - Permissão: `adminProcedure`

- **`adicionarItem`** - Adiciona item ao template
  - Input: `{ templateId, titulo, descricao?, tipo, obrigatorio, peso }`
  - Output: Item criado
  - Permissão: `adminProcedure`

- **`atualizarItem`** - Atualiza item existente
  - Input: `{ id, ...dadosItem }`
  - Output: Item atualizado
  - Permissão: `adminProcedure`

- **`deletarItem`** - Inativa item (soft delete)
  - Input: `{ id }`
  - Output: `{ success: boolean }`
  - Permissão: `adminProcedure`

- **`reordenarItens`** - Reordena itens do template
  - Input: `{ templateId, itens: [{ id, ordem }] }`
  - Output: `{ success: boolean }`
  - Permissão: `adminProcedure`

### Avaliações (`trpc.checklist.avaliacoes.*`)

#### Queries
- **`listar`** - Lista avaliações com filtros
  - Input: `{ templateId?, unidadeId?, avaliadorId?, status?, classificacao?, dataInicio?, dataFim?, pagina?, limite? }`
  - Output: Lista paginada com dados relacionados
  - Permissão: `protectedProcedure`

- **`buscar`** - Busca avaliação por ID
  - Input: `{ id }`
  - Output: Avaliação completa com relacionamentos
  - Permissão: `protectedProcedure`

- **`gerarRelatorio`** - Gera relatório de avaliações
  - Input: `{ templateId?, unidadeId?, dataInicio?, dataFim?, agruparPor }`
  - Output: Array de dados do relatório
  - Permissão: `protectedProcedure`

- **`gerarComparativo`** - Comparativo entre unidades
  - Input: `{ templateId?, dataInicio?, dataFim?, unidadeIds? }`
  - Output: Ranking de unidades com estatísticas
  - Permissão: `protectedProcedure`

#### Mutations
- **`criar`** - Cria nova avaliação
  - Input: `{ templateId, unidadeId, dataAgendada?, observacoes?, respostas? }`
  - Output: Avaliação criada
  - Permissão: `protectedProcedure`
  - Nota: Se todas as respostas forem fornecidas, finaliza automaticamente

- **`atualizar`** - Atualiza avaliação
  - Input: `{ id, status?, observacoes?, respostas? }`
  - Output: Avaliação atualizada
  - Permissão: `protectedProcedure`
  - Nota: Se status = "concluida", calcula média automaticamente

- **`deletar`** - Remove avaliação
  - Input: `{ id }`
  - Output: `{ success: boolean }`
  - Permissão: `protectedProcedure`

## Services

### ChecklistTemplatesService

#### Métodos Principais
- **`criar(data, criadoPorId)`** - Cria template com itens em transação
- **`listar(filtros)`** - Lista templates com paginação e filtros
- **`buscar(id)`** - Busca template com itens opcionais
- **`atualizar(id, data)`** - Atualiza template
- **`deletar(id)`** - Soft delete do template
- **`adicionarItem(templateId, itemData)`** - Adiciona item com ordem automática
- **`atualizarItem(itemId, data)`** - Atualiza item existente
- **`deletarItem(itemId)`** - Soft delete do item
- **`reordenarItens(templateId, itens)`** - Reordena itens em transação

### ChecklistAvaliacoesService

#### Métodos Principais
- **`criar(data, avaliadorId)`** - Cria avaliação com respostas opcionais
- **`listar(filtros)`** - Lista avaliações com relacionamentos
- **`buscar(id)`** - Busca avaliação completa
- **`atualizar(id, data)`** - Atualiza avaliação e respostas em transação
- **`deletar(id)`** - Remove avaliação
- **`finalizarAvaliacao(id, tx?)`** - Calcula média e finaliza
- **`gerarRelatorio(filtros)`** - Gera dados para relatório
- **`gerarComparativo(filtros)`** - Calcula ranking de unidades

#### Métodos Utilitários
- **`calcularMedia(respostas)`** - Calcula média ponderada das notas
- **`classificarNota(media)`** - Converte média em classificação

## Sistema de Pontuação

### Cálculo da Média
1. **Filtragem**: Apenas itens do tipo "nota_1_5" são considerados
2. **Ponderação**: Cada resposta é multiplicada pelo peso do item
3. **Média**: Soma ponderada dividida pela soma dos pesos
4. **Classificação**: Média é convertida automaticamente em classificação

### Exemplo de Cálculo
```javascript
// Itens do template
Item 1: peso 2.0, nota 4 → 4 * 2.0 = 8.0
Item 2: peso 1.5, nota 3 → 3 * 1.5 = 4.5  
Item 3: peso 1.0, nota 5 → 5 * 1.0 = 5.0

// Cálculo
Soma ponderada: 8.0 + 4.5 + 5.0 = 17.5
Soma dos pesos: 2.0 + 1.5 + 1.0 = 4.5
Média final: 17.5 / 4.5 = 3.89

// Classificação: 3.89 → "bom" (3.5-4.4)
```

## Tipos TypeScript

### Tipos Base
- `ChecklistTemplate` - Modelo da tabela de templates  
- `ChecklistItem` - Modelo da tabela de itens
- `ChecklistAvaliacao` - Modelo da tabela de avaliações
- `ChecklistResposta` - Modelo da tabela de respostas

### Tipos de Formulário
- `CreateChecklistTemplateData` - Dados para criar template
- `CreateAvaliacaoData` - Dados para criar avaliação

### Tipos de Relatório
- `RelatorioAvaliacao` - Linha do relatório de avaliações
- `ComparativoUnidades` - Dados do comparativo entre unidades

## Validação com Zod

### Validações Principais
- **Templates**: Nome obrigatório, pelo menos 1 item, validação de periodicidade
- **Itens**: Título obrigatório, peso entre 0.1 e 10, ordem positiva
- **Avaliações**: Template e unidade obrigatórios, validação de datas
- **Respostas**: Notas entre 1-5, textos limitados, observações opcionais

### Schemas de Entrada
- `createChecklistTemplateSchema` - Validação para criar templates
- `createAvaliacaoSchema` - Validação para criar avaliações  
- `listChecklistTemplatesSchema` - Validação para filtros de listagem
- `relatorioAvaliacoesSchema` - Validação para parâmetros de relatório

## Fluxo de Trabalho Típico

### 1. Configuração Inicial
1. Administrador cria **template** com nome, periodicidade e descrição
2. Adiciona **itens** ao template (perguntas) com tipos, pesos e ordem
3. Ativa o template para uso

### 2. Processo de Avaliação
1. Usuário cria **avaliação** selecionando template e unidade
2. Preenche **respostas** para cada item do template
3. Sistema calcula **média ponderada** automaticamente
4. Avaliação é **finalizada** com classificação

### 3. Análise de Resultados
1. Visualização de **lista de avaliações** com filtros
2. Geração de **relatórios** por período, template ou unidade
3. **Comparativo** entre unidades com ranking
4. Análise de **tendências** ao longo do tempo

## Relacionamentos

### Template → Itens (1:N)
- Um template possui múltiplos itens
- Itens são ordenados para exibição consistente
- Soft delete: inativar template não remove itens

### Avaliação → Respostas (1:N)  
- Uma avaliação possui uma resposta para cada item obrigatório
- Tipos de resposta variam conforme tipo do item
- Transacional: criar/atualizar avaliação afeta respostas

### Usuário → Templates/Avaliações (1:N)
- Usuário pode criar múltiplos templates (se admin)
- Usuário pode realizar múltiplas avaliações
- Auditoria: registro de quem criou/avaliou

### Unidade → Avaliações (1:N)
- Unidade pode ser avaliada múltiplas vezes
- Histórico de avaliações para comparação temporal
- Base para relatórios e rankings

## Considerações de Performance

### Índices de Banco
- `nome` em templates para busca textual
- `ativo` em templates e itens para filtragem
- `status` e `classificacao` em avaliações para relatórios
- `criadoEm` para ordenação temporal

### Paginação
- Todas as listagens implementam paginação
- Limite máximo de 100 registros por página
- Contadores otimizados com queries separadas

### Transações
- Criação de templates com itens
- Atualização de avaliações com respostas  
- Reordenação de itens
- Finalização com cálculo de média

## Extensibilidade

### Novos Tipos de Item
1. Adicionar ao `tipoItemChecklistEnum`
2. Atualizar schema de validação  
3. Implementar lógica no service
4. Atualizar interface do usuário

### Novos Tipos de Relatório
1. Criar novo schema de validação
2. Implementar método no service
3. Adicionar endpoint no router
4. Criar interface no frontend

### Integração com Outros Módulos
- **Core**: Usuários, empresas e unidades
- **RH**: Funcionários como avaliadores
- **Almoxarifado**: Avaliações de estoque
- **Notifications**: Alertas de avaliações pendentes

