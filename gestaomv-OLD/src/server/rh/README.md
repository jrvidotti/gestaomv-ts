# Módulo RH (Recursos Humanos)

Este módulo implementa um sistema completo de gestão de Recursos Humanos com funcionalidades CRUD para todas as entidades relacionadas ao departamento pessoal.

## 📋 Visão Geral

O módulo RH oferece gerenciamento completo de:

- **Estrutura Organizacional**: Equipes, departamentos e cargos
- **Funcionários**: Cadastro, controle de status e vínculos
- **Avaliações**: Sistema de avaliações de experiência e periódicas
- **Relacionamentos**: Vínculos entre usuários, funcionários e equipes

## 🏗️ Arquitetura

### Services Implementados

```
backend/src/rh/
├── equipes.service.ts                  # CRUD para equipes
├── departamentos.service.ts            # CRUD para departamentos
├── cargos.service.ts                   # CRUD para cargos
├── funcionarios.service.ts             # CRUD para funcionários
├── user-funcionarios.service.ts        # Vínculo usuário-funcionário
├── equipe-funcionarios.service.ts      # Relacionamento equipe-funcionário
├── avaliacoes-experiencia.service.ts   # Avaliações período experiência
├── avaliacoes-periodicas.service.ts    # Avaliações periódicas
├── rh.router.ts                        # Router tRPC com 50+ procedures
├── rh.module.ts                        # Módulo NestJS
└── README.md                           # Esta documentação
```

### Entidades do Schema

#### 1. **Equipes**
```typescript
interface Equipe {
  id: number;
  nome: string;
  codigo: string; // Único
  criadoEm: string;
  atualizadoEm: string;
}
```

#### 2. **Departamentos**
```typescript
interface Departamento {
  id: number;
  nome: string; // Único
  descricao?: string;
  pontowebId?: number; // Integração externa
  criadoEm: string;
  atualizadoEm: string;
}
```

#### 3. **Cargos**
```typescript
interface Cargo {
  id: number;
  nome: string; // Único
  descricao?: string;
  departamentoId: number; // FK para departamentos
  pontowebId?: number;
  criadoEm: string;
  atualizadoEm: string;
}
```

#### 4. **Funcionários**
```typescript
interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento?: string;
  sexo?: string;
  nomeMae?: string;
  email?: string;
  telefone?: string;
  foto?: string;
  // Dados profissionais
  cargoId: number;
  departamentoId: number;
  empresaId?: number;
  unidadeId?: number;
  // Controle de status
  dataAdmissao: string;
  dataAvisoPrevio?: string;
  dataDesligamento?: string;
  status: 'EM_CONTRATACAO' | 'PERIODO_EXPERIENCIA' | 'ATIVO' | 'AVISO_PREVIO' | 'DESLIGADO';
  pontowebId?: number;
  criadoEm: string;
  atualizadoEm: string;
}
```

#### 5. **Tabelas de Relacionamento**

**UserFuncionarios**: Vínculo único entre usuários do sistema e funcionários
```typescript
interface UserFuncionario {
  userId: string; // FK para users
  funcionarioId: string; // FK para funcionarios
}
```

**EquipeFuncionarios**: Relacionamento muitos-para-muitos entre equipes e funcionários
```typescript
interface EquipeFuncionario {
  id: number;
  funcionarioId: string;
  equipeId: number;
  ehLider: boolean; // Define se é líder da equipe
  criadoEm: string;
  atualizadoEm: string;
}
```

#### 6. **Sistema de Avaliações**

**Avaliações de Experiência** (45 e 90 dias):
```typescript
interface AvaliacaoExperiencia {
  id: number;
  funcionarioId: number;
  avaliadorId: number;
  tipo: 'AVALIACAO_45_DIAS' | 'AVALIACAO_90_DIAS';
  dataAvaliacao: string;
  // Critérios (escala 1-5)
  pontualidade: number;
  comprometimento: number;
  trabalhoEquipe: number;
  iniciativa: number;
  comunicacao: number;
  conhecimentoTecnico: number;
  // Resultado
  mediaFinal: number; // Calculada automaticamente
  recomendacao: 'EFETIVACAO' | 'PRORROGACAO' | 'DESLIGAMENTO';
  pontosFortes?: string;
  pontosMelhoria?: string;
  observacoes?: string;
}
```

**Avaliações Periódicas**:
```typescript
interface AvaliacaoPeriodica {
  id: number;
  funcionarioId: number;
  avaliadorId: number;
  periodoInicial: string;
  periodoFinal: string;
  dataAvaliacao: string;
  // Critérios expandidos (escala 1-5)
  desempenho: number;
  comprometimento: number;
  trabalhoEquipe: number;
  lideranca: number;
  comunicacao: number;
  inovacao: number;
  resolucaoProblemas: number;
  qualidadeTrabalho: number;
  // Resultado
  mediaFinal: number; // Calculada automaticamente
  classificacao: 'EXCELENTE' | 'BOM' | 'SATISFATORIO' | 'INSATISFATORIO';
  // Gestão de performance
  metasAnterior?: string;
  avaliacaoMetas?: string;
  novasMetas?: string;
  feedbackGeral?: string;
  planoDesenvolvimento?: string;
}
```

## 🚀 Como Usar

### 1. tRPC Procedures Disponíveis

O módulo expõe 50+ procedures via tRPC organizadas por entidade:

```typescript
// No frontend
import { api } from '@/lib/trpc';

// Exemplo: Listar funcionários ativos
const { data: funcionarios } = api.rh.listarFuncionarios.useQuery({
  status: ['ATIVO'],
  pagina: 1,
  limite: 20
});

// Criar novo funcionário (admin only)
const criarFuncionario = api.rh.criarFuncionario.useMutation();

// Buscar funcionário com relacionamentos
const { data: funcionario } = api.rh.buscarFuncionario.useQuery({ id: 123 });
```

### 2. Principais Procedures por Entidade

#### **Equipes**
- `criarEquipe` (admin)
- `listarEquipes` (protected)
- `buscarEquipe` (protected)
- `atualizarEquipe` (admin)
- `deletarEquipe` (admin)

#### **Departamentos**
- `criarDepartamento` (admin)
- `listarDepartamentos` (protected)
- `buscarDepartamento` (protected)
- `atualizarDepartamento` (admin)
- `deletarDepartamento` (admin)

#### **Cargos**
- `criarCargo` (admin)
- `listarCargos` (protected)
- `buscarCargo` (protected)
- `buscarCargosPorDepartamento` (protected)
- `atualizarCargo` (admin)
- `deletarCargo` (admin)

#### **Funcionários**
- `criarFuncionario` (admin)
- `listarFuncionarios` (protected) - Filtros avançados
- `buscarFuncionario` (protected) - Com relacionamentos
- `buscarFuncionariosPorDepartamento` (protected)
- `buscarFuncionariosPorCargo` (protected)
- `atualizarFuncionario` (admin)
- `alterarStatusFuncionario` (admin)
- `deletarFuncionario` (admin)

#### **Gestão de Equipes**
- `adicionarFuncionarioEquipe` (admin)
- `buscarFuncionariosPorEquipe` (protected)
- `buscarEquipesPorFuncionario` (protected)
- `definirLiderEquipe` (admin)
- `removerFuncionarioDaEquipe` (admin)

#### **Vínculo User-Funcionário**
- `criarUserFuncionario` (admin)
- `buscarFuncionarioPorUser` (protected)
- `deletarUserFuncionario` (admin)

#### **Sistema de Avaliações**
- `criarAvaliacaoExperiencia` (admin)
- `listarAvaliacoesExperiencia` (protected)
- `buscarAvaliacaoExperiencia` (protected)
- `buscarAvaliacoesPorFuncionario` (protected)
- `criarAvaliacaoPeriodica` (admin)
- `listarAvaliacoesPeriodicas` (protected)
- `buscarAvaliacaoPeriodica` (protected)
- `buscarAvaliacoesPeriodicasPorFuncionario` (protected)

### 3. Filtros e Busca

#### **Funcionários - Filtros Avançados**
```typescript
const filtros = {
  busca: "João", // Nome, CPF ou email
  cargoId: 5,
  departamentoId: 2,
  empresaId: 1,
  unidadeId: 3,
  status: ['ATIVO', 'PERIODO_EXPERIENCIA'], // Array de status
  pagina: 1,
  limite: 50
};
```

#### **Avaliações - Filtros por Período**
```typescript
const filtrosAvaliacao = {
  funcionarioId: 123,
  dataInicial: "2024-01-01",
  dataFinal: "2024-12-31",
  tipo: "AVALIACAO_90_DIAS", // Para experiência
  classificacao: "EXCELENTE" // Para periódicas
};
```

## 🔐 Controle de Acesso

### Permissões
- **Admin**: Acesso total (criar, editar, deletar)
- **Protected**: Visualização e consultas (usuários autenticados)

### Procedures que Requerem Admin
- Todas as operações de `criar`, `atualizar`, `deletar`
- Alteração de status de funcionários
- Gestão de equipes e liderança
- Criação de avaliações

## ⚡ Funcionalidades Especiais

### 1. **Cálculo Automático de Médias**
- Avaliações de experiência: média de 6 critérios
- Avaliações periódicas: média de 8 critérios + classificação automática

### 2. **Relacionamentos Complexos**
- Funcionários incluem dados de cargo, departamento, empresa e unidade
- Equipes mostram funcionários com indicação de liderança
- Avaliações incluem dados completos do funcionário e avaliador

### 3. **Controle de Status de Funcionários**
```typescript
type StatusFuncionario = 
  | 'EM_CONTRATACAO'     // Processo seletivo
  | 'PERIODO_EXPERIENCIA' // 45-90 dias
  | 'ATIVO'              // Efetivado
  | 'AVISO_PREVIO'       // Processo de desligamento
  | 'DESLIGADO';         // Inativo
```

### 4. **Integração com Sistema Externo**
- Campos `pontowebId` para sincronização com sistemas de ponto

## 📊 Casos de Uso Comuns

### 1. **Dashboard de RH**
```typescript
// Funcionários por status
const ativos = await api.rh.listarFuncionarios.query({ status: ['ATIVO'] });
const experiencia = await api.rh.listarFuncionarios.query({ 
  status: ['PERIODO_EXPERIENCIA'] 
});

// Avaliações pendentes
const avaliacoesPendentes = await api.rh.listarAvaliacoesExperiencia.query({
  dataInicial: "2024-01-01"
});
```

### 2. **Gestão de Performance**
```typescript
// Histórico de avaliações do funcionário
const historicoAvaliacoes = await api.rh.buscarAvaliacoesPeriodicasPorFuncionario.query({
  funcionarioId: 123
});

// Funcionários com classificação excelente
const topPerformers = await api.rh.listarAvaliacoesPeriodicas.query({
  classificacao: 'EXCELENTE'
});
```

### 3. **Organograma**
```typescript
// Estrutura departamental
const departamentos = await api.rh.listarDepartamentos.query();
const cargos = await api.rh.listarCargos.query({ departamentoId: 1 });
const funcionarios = await api.rh.buscarFuncionariosPorDepartamento.query({
  departamentoId: 1
});

// Equipes e lideranças
const equipesFuncionarios = await api.rh.buscarFuncionariosPorEquipe.query({
  equipeId: 5
});
```

## 🛠️ Desenvolvimento

### Adicionando Novas Funcionalidades

1. **Novo Service**: Criar em `/src/rh/[entidade].service.ts`
2. **Router**: Adicionar procedures em `/src/rh/rh.router.ts`
3. **Módulo**: Registrar em `/src/rh/rh.module.ts`
4. **Validação**: Criar schemas Zod no router

### Padrões Estabelecidos

- **Services**: Métodos `criar`, `listar`, `buscarPorId`, `atualizar`, `deletar`
- **Filtros**: Interface `Filtros[Entidade]` com paginação
- **Procedures**: Validação Zod + controle de acesso consistente
- **Relacionamentos**: Usar `with` do Drizzle para joins

## 📈 Performance

- **Paginação**: Limite máximo de 100 itens por consulta
- **Índices**: Criados automaticamente pelo Drizzle nas FKs
- **Joins**: Otimizados com leftJoin apenas quando necessário
- **Cache**: Pode ser implementado via tRPC no frontend

## 🔗 Integrações

- **Auth**: Integrado com sistema de autenticação JWT
- **Empresas/Unidades**: Relacionamento com módulo base
- **Drizzle ORM**: Type-safe database operations
- **tRPC**: Type-safe API calls end-to-end

---

**Próximos Passos**: Implementar frontend com formulários, dashboards e relatórios usando os procedures tRPC disponíveis.