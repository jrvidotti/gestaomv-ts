# Especificação do Módulo Factoring

## 1. Visão Geral

O módulo de factoring é responsável pelo controle de concessão de crédito e operações financeiras baseadas em cheques e notas promissórias. O sistema permite a gestão completa do processo de factoring, desde o cadastro de pessoas e clientes até a execução e acompanhamento das operações financeiras.

## 2. Objetivos

- Controlar a concessão de crédito para clientes
- Gerenciar operações financeiras baseadas em cheques e notas promissórias
- Manter histórico completo de operações e documentos
- Facilitar a tomada de decisões através de simulações
- Garantir rastreabilidade através de sistema de arquivos e anexos

## 3. Entidades Principais

### 3.1. Carteira

Carteira de pagamentos e recebimentos

**Campos obrigatórios:**

- ID único
- Nome
- Banco
- Agência
- Conta
- Chave pix
- Usuário

### 3.2. Pessoa

Entidade base para o cadastro de pessoas físicas e jurídicas.

**Campos obrigatórios:**

- ID único
- Tipo de pessoa (física/jurídica)
- Documento (CPF para pessoa física, CNPJ para pessoa jurídica)
- Nome/Razão social
- Data de cadastro

**Campos opcionais:**

- Nome fantasia (para pessoa jurídica)
- Data de nascimento/fundação
- Inscrição estadual
- Inscrição municipal
- Nome da mãe
- Sexo
- E-mail
- Observações gerais

**Endereço:**

- CEP
- Logradouro
- Número
- Complemento
- Bairro
- Cidade
- Estado

**Relacionamentos:**

- Múltiplos telefones
- Múltiplos dados bancários

**Observação:** O endereço está embutido na entidade pessoa para simplificar o modelo. Caso seja necessário múltiplos endereços no futuro, pode ser extraído para entidade separada.

### 3.3. Telefone

**Campos:**

- ID único
- ID da pessoa (chave estrangeira)
- Número com DDD
- Principal (boolean - só pode haver um telefone principal)
- WhatsApp (boolean - podem haver vários)
- Inativo (boolean)

### 3.4. Dados Bancários

**Campos:**

- ID único
- ID da pessoa (chave estrangeira)
- Banco (código)
- Agência
- Conta
- Dígito verificador da conta
- Tipo de conta: corrente (padrão), poupança
- Titular da conta (em branco se é a pessoa)

### 3.5. Cliente

Estende a entidade Pessoa com informações específicas para realização de operações.

**Campos adicionais:**

- ID único
- ID da pessoa (chave estrangeira - herança)
- Data de cadastro como cliente
- Status do cliente (ativo, inativo, bloqueado, suspenso)
- Observações específicas do cliente
- Crédito autorizado (boolean)
- Limite de crédito (valor monetário)
- Taxa de juros padrão (percentual)
- Valor da tarifa de devolução de cheques
- Valor da tarifa de prorrogação
- Data da última análise de crédito
- Usuário responsável pela análise
- Histórico de alterações de limite

**Relacionamentos:**

- Múltiplos contatos de referência

### 3.6. Contato de Referência

**Campos:**

- ID único
- ID do cliente (chave estrangeira)
- Tipo de referência (sócio, funcionário, referência pessoal, referência comercial)
- ID da pessoa (chave estrangeira, opcional) - vincula a pessoa já cadastrada no sistema
- Nome completo (obrigatório se ID da pessoa não informado)
- Telefone (obrigatório)
- E-mail (opcional)
- Documento CPF/CNPJ (opcional, obrigatório para referências comerciais)
- Empresa/organização (opcional)
- Cargo/função (opcional)
- Observações

**Regra de negócio:** Se o campo "ID da pessoa" for preenchido, os dados serão carregados automaticamente da pessoa cadastrada. Caso contrário, os campos nome e telefone são obrigatórios.

### 3.7. Simulação de Operação

**Campos:**

- ID único
- ID do cliente (chave estrangeira)
- Data da simulação
- Usuário que realizou a simulação
- Taxa de juros aplicada na simulação
- Observações
- Data base da simulação
- Data de validade da simulação
- Status da simulação (pendente, aprovada, rejeitada, convertida em operação)
- Usuário que aprovou a simulação
- Data de aprovação

**Relacionamentos:**

- Múltiplos documentos da simulação

### 3.8. Documento da Simulação

**Campos:**

- ID único
- ID da simulação (chave estrangeira)
- Data de vencimento
- Valor do documento
- Float (dias extras para compensação)
- Dias até o vencimento (calculado)
- Dias totais com float (calculado)
- Observações

### 3.9. Operação

**Campos:**

- ID único
- Número da operação (sequencial/protocolo)
- ID do cliente (chave estrangeira)
- ID da simulação (chave estrangeira - opcional, se baseada em simulação)
- Data da operação
- Taxa de juros aplicada
- Valor líquido da operação
- Status da operação (pendente, liquidada, cancelada)
- Data de pagamento (quando liquidada)
- Carteira de pagamento (chave estrangeira)
- Usuário responsável pela operação
- Observações

**Relacionamentos:**

- Múltiplos documentos da operação
- Histórico de status

### 3.10. Documento da Operação

**Campos base:**

- ID único
- ID da operação (chave estrangeira)
- Tipo de documento (nota_promissoria, cheque)
- Data de vencimento
- Valor do documento
- Float (dias extras)
- Data de vencimento prorrogada
- Status do documento (pendente, compensado, devolvido, protestado, resgatado)
- Valor de juros da operação
- Observações

**Campos específicos para Nota Promissória:**

- ID da pessoa emitente da Nota Promissória (chave estrangeira)
- ID da pessoa avalista da Nota Promissória (opcional)
- Número do documento (se deixado em branco, utiliza o ID do documento)

**Campos específicos para Cheque:**

- ID dos dados bancários (chave estrangeira)
- Número do cheque

### 3.11. Ocorrência do Documento

**Campos:**

- ID único
- ID do documento (chave estrangeira)
- Tipo de ocorrência (compensação, devolução, protesto, prorrogação, resgate)
- Data da ocorrência
- Data de vencimento atual
- Data de vencimento prorrogada
- Valor da compensação
- Valor de juros da prorrogação
- Valor de tarifa
- Usuário
- Observação

### 3.12. Lançamentos

Esta tabela registra todos os lançamentos financeiros do cliente, incluindo operações, ocorrências de documentos e recebimentos.

**Campos:**

- ID único
- ID do cliente (chave estrangeira)
- ID da operação (chave estrangeira, opcional)
- ID da ocorrência do documento (chave estrangeira, opcional)
- Data do lançamento
- Valor do lançamento
- Tipo do lançamento (entrada, saída)
- Origem do lançamento (operacao, ocorrencia, recebimento_manual)
- Carteira de lançamento (chave estrangeira)
- Observação
- Usuário
- Data de criação

**Regra de negócio:** Apenas um dos campos de referência (operação, ocorrência) deve ser preenchido por lançamento. Para recebimentos manuais, nenhum campo de referência é obrigatório.

### 3.13. Recebimentos

**Campos:**

- ID único
- ID do cliente (chave estrangeira)
- Data do recebimento
- Valor do recebimento
- Carteira de recebimento (chave estrangeira)
- Observação
- Usuário
- Data de criação

**Regra de negócio:** Ao criar um recebimento, é automaticamente gerado um lançamento correspondente do tipo "entrada" com origem "recebimento_manual".

### 3.14. Histórico de Observações e Arquivos

**Campos:**

- ID único
- Tipo de entidade (pessoa, cliente, documento, operação)
- ID da entidade
- Observação
- Tipo do arquivo (documento, comprovante, foto, anexo geral)
- Chave do arquivo no S3
- Data
- Usuário
- Status (ativo, arquivado)

## 4. Regras de Negócio

### 4.0. Parametros do Sistema

- Validade de simulação (padrão 7 dias)
- Tipo de juros (simples ou composto)
- Taxa de juros padrão
- Tarifa de devolução de cheques
- Tarifa de prorrogação

### 4.1. Cadastro de Pessoas

- Documento (CPF/CNPJ) deve ser único no sistema
- Documento pode ser buscado utilizando a API Direct Data
- CPF deve ser validado segundo algoritmo oficial
- CNPJ deve ser validado segundo algoritmo oficial
- Pelo menos um telefone deve ser cadastrado
- Pelo menos um endereço deve ser cadastrado
- E-mail deve seguir formato válido quando informado

### 4.2. Dados Bancários

- Uma pessoa pode ter múltiplas contas bancárias

### 4.3. Cadastro de Clientes

- Todo cliente deve ter pelo menos uma referência cadastrada
- Limite de crédito deve ser maior que zero para clientes autorizados
- Taxa de juros deve estar entre 0% e 100%
- Tarifas devem ser valores zero ou positivos

### 4.4. Contatos de Referência

- Telefone é obrigatório para todas as referências

### 4.5. Simulações

- Calcular data de validade da simulação baseada utilizando o parametro de validade de simulação
- Documentos devem ter data de vencimento acima da data base

### 4.6. Operações

- Cliente deve ter crédito autorizado
- Valor líquido da operação não pode exceder o limite disponível do cliente
- Pelo menos um documento deve estar vinculado à operação
- Operação só pode ser cancelada se não houver documentos compensados

### 4.7. Documentos

- Data de vencimento deve ser futura à data da operação
- Valor deve ser positivo
- Para cheques: número deve ser único por conta bancária
- Para notas promissórias: número deve ser único por emitente
- Float é aplicado sobre a data de vencimento para cálculo de juros

### 4.8. Cálculos Financeiros

- Juros Simples = Valor do documento × Taxa diária × Dias totais
- Juros Compostos = Valor do documento × ((1 + Taxa diária)^Dias totais - 1)
- Valor líquido = Valor total dos documentos - Juros
- Float adiciona dias extras ao período de cobrança de juros
- Dias totais = Dias corridos entre data de operação e data de vencimento + Float

**Regra para cálculo de dias:**

- Sempre utilizar dias corridos (incluindo finais de semana e feriados)
- Float é adicionado à data de vencimento antes do cálculo
- O cálculo é: diferença em dias corridos entre data da operação e (data de vencimento + float)

**Exemplos de cálculo:**

- **Exemplo 1:**
  - Data de operação: 06/08/2025
  - Data de vencimento: 12/08/2025 (terça)
  - Float: 2 dias
  - Dias totais: 6 + 2 = 8 dias

- **Exemplo 2:**
  - Data de operação: 08/08/2025
  - Data de vencimento: 14/08/2025 (quinta)
  - Float: 2 dias (16/08/2025 - sábado)
  - Por conta do vencimento + float cair no sábado, são adicionados 2 dias corridos (sábado e domingo)
  - Dias totais: 6 (dias corridos) + 2 (float) + 2 (final de semana) = 10 dias

- **Exemplo 3:**
  - Data de operação: 11/08/2025
  - Data de vencimento: 17/08/2025 (domingo)
  - Por conta de domingo, o dia 18/08/2025 (segunda) é considerado dia corrido
  - Float: 2 dias
  - Dias totais: 6 (dias corridos) + 1 (domingo) + 2 (float) = 9 dias

### 4.9. Lançamento do Cliente

- Operação pendente: deve-se registrar um lançamento de crédito para o cliente no valor líquido da operação
- Operação liquidada: deve-se registrar um lançamento de débito para o cliente no valor líquido da operação
- Ocorrência tipo "prorrogação": registrar lançamento de débito no valor do juros e tarifa de prorrogação
- Ocorrência tipo "resgate": registrar lançamento de débito no valor do juros e tarifa de resgate
- Ocorrência tipo "compensação" e documento estava "pendente": não registrar lançamento
- Ocorrência tipo "devolução": registrar lançamento de débito no valor do documento e tarifa de devolução
- Ocorrência tipo "protesto": registrar lançamento de débito no valor da tarifa de protesto
- Ocorrência tipo "compensação" e documento estava com status "devolvido" ou "protestado": registrar lançamento de crédito no valor do documento
- Ao lançar um recebimento: registrar lançamento de crédito no valor do recebimento

O cadastro de ocorrência altera o status do documento.

## 5. Estados e Status

### 5.1. Status de Cliente

- **Ativo**: Cliente pode realizar operações normalmente
- **Inativo**: Cliente cadastrado mas não pode realizar operações
- **Bloqueado**: Cliente temporariamente impedido de operar
- **Suspenso**: Cliente com restrições específicas

### 5.2. Status de Simulação

- **Pendente**: Aguardando análise ou decisão
- **Aprovada**: Aprovada para conversão em operação
- **Rejeitada**: Não aprovada para operação
- **Convertida**: Já convertida em operação efetiva
- **Expirada**: Prazo de validade vencido (o status no banco é Pendente, mas a data de validade é menor que a data atual)

### 5.3. Status de Operação

- **Pendente**: Operação em andamento, aguardando liquidação
- **Liquidada**: Operação totalmente liquidada
- **Cancelada**: Operação cancelada

### 5.4. Status de Documento

- **Pendente**: Aguardando compensação
- **Compensado**: Documento foi compensado com sucesso
- **Devolvido**: Documento foi devolvido pelo banco
- **Protestado**: Documento foi protestado
- **Resgatado**: Documento foi resgatado pelo cliente

### 5.5. Tipo de Ocorrência

- **Compensação**: Documento foi compensado com sucesso
- **Devolução**: Documento foi devolvido pelo banco
- **Protesto**: Documento foi protestado
- **Prorrogação**: Documento teve vencimento prorrogado
- **Resgate**: Documento foi resgatado pelo cliente

## 6. Funcionalidades do Sistema

### 6.1. Gestão de Cadastros

- CRUD completo de pessoas e clientes
- Gestão de endereços, telefones e e-mails
- Gestão de dados bancários
- Cadastro e manutenção de referências
- Controle de informações de crédito

### 6.2. Simulações

- Criação de simulações de operação
- Cálculo automático de juros e valores líquidos
- Aprovação/rejeição de simulações
- Conversão de simulações em operações

### 6.3. Operações

- Criação de operações baseadas em simulações ou diretas
- Gestão de documentos (cheques e notas promissórias)
- Controle de status e pagamentos
- Cálculos financeiros automáticos

### 6.4. Relatórios e Consultas

#### 📊 Relatórios Operacionais

**1. Relatório de Operações**

- Filtros: Período, cliente, status, carteira, usuário
- Dados: Número da operação, cliente, data, valor bruto, valor líquido, taxa, status, vencimentos
- Totalizadores: Quantidade de operações, valor total bruto, valor total líquido, juros totais

**2. Posição de Documentos**

- Filtros: Período de vencimento, tipo de documento, status, cliente
- Dados: Documento, cliente, data de vencimento, valor, status, dias em atraso
- Agrupamento: Por status (pendente, compensado, devolvido, protestado)

**3. Agenda de Vencimentos**

- Filtros: Período futuro (próximos 30/60/90 dias)
- Dados: Data de vencimento, cliente, tipo de documento, valor, float
- Ordenação: Por data de vencimento
- Indicadores: Documentos do dia, da semana, do mês

#### 💰 Relatórios Financeiros

**4. Fluxo de Caixa**

- Filtros: Período, carteira
- Dados: Data, descrição, entrada, saída, saldo acumulado
- Origem: Operações, compensações, devoluções, recebimentos
- Projeção: Baseada nos vencimentos futuros

**5. Rentabilidade por Cliente**

- Filtros: Período, cliente
- Dados: Cliente, número de operações, valor operado, juros recebidos, tarifas, lucro líquido
- Indicadores: Margem de lucro, ticket médio, frequência

**6. Análise de Inadimplência**

- Filtros: Período, faixas de atraso
- Dados: Cliente, valor em atraso, dias de atraso, histórico de ocorrências
- Estatísticas: Taxa de inadimplência, provisão para perdas

#### 📋 Relatórios de Controle

**7. Carteira de Clientes**

- Filtros: Status do cliente, limite de crédito, região
- Dados: Cliente, status, limite, utilizado, disponível, última operação
- Análises: Clientes ativos vs inativos, concentração de risco

**8. Utilização de Limite**

- Filtros: Cliente, percentual de utilização
- Dados: Cliente, limite, utilizado, disponível, percentual utilizado
- Alertas: Clientes próximos do limite, limites zerados

**9. Simulações vs Operações**

- Filtros: Período, status da simulação
- Dados: Simulação, cliente, valor simulado, taxa, status, operação resultante
- Taxa de conversão: Simulações convertidas em operações

#### 📈 Relatórios Analíticos

**10. Performance por Usuário**

- Filtros: Período, usuário
- Dados: Usuário, operações realizadas, valor operado, simulações criadas
- Produtividade: Volume por usuário, tempo médio de análise

**11. Análise de Tarifas**

- Filtros: Período, tipo de tarifa
- Dados: Tipo de tarifa, quantidade, valor arrecadado
- Detalhamento: Tarifas de devolução, prorrogação, protesto

**12. Histórico de Ocorrências**

- Filtros: Período, tipo de ocorrência, cliente
- Dados: Data, cliente, documento, tipo de ocorrência, valor, usuário
- Estatísticas: Frequência por tipo, clientes com mais ocorrências

#### 🎯 Relatórios Gerenciais

**13. Dashboard Executivo**

- KPIs: Volume operado, carteira ativa, taxa de inadimplência, rentabilidade
- Gráficos: Evolução mensal, comparativo anual, distribuição por cliente
- Alertas: Limites ultrapassados, documentos vencidos, metas

**14. Análise de Risco**

- Filtros: Período, faixa de limite
- Dados: Concentração por cliente, exposição total, garantias
- Indicadores: Maior cliente (%), top 10 clientes, diversificação

**15. Auditoria de Operações**

- Filtros: Período, usuário, tipo de ação
- Dados: Data/hora, usuário, ação realizada, dados alterados
- Rastreabilidade: Criação, alteração, cancelamento de operações

#### 📊 Relatórios Customizáveis

**16. Consulta de Lançamentos**

- Filtros: Cliente, período, tipo, carteira
- Dados: Data, descrição, origem, entrada, saída, saldo
- Exportação: Excel, PDF, CSV

**17. Extrato do Cliente**

- Filtros: Cliente específico, período
- Dados: Operações, documentos, ocorrências, recebimentos, saldo
- Formato: Similar a extrato bancário

#### 🔄 Configurações de Relatório

**Recursos Comuns:**

- Exportação: PDF, Excel, CSV
- Agendamento: Diário, semanal, mensal
- Filtros salvos: Templates de consulta
- Gráficos: Visualizações interativas
- Drill-down: Detalhamento por clique
- Comparativos: Período anterior, meta vs realizado

**Permissões:**

- Relatórios por perfil de usuário
- Dados sensíveis protegidos
- Log de acessos aos relatórios

### 6.5. Gestão de Arquivos

- Upload de documentos e anexos
- Organização por tipo e entidade
- Controle de versões
- Histórico de alterações
- Download e visualização

### 6.6. Auditoria

- Log de todas as operações realizadas
- Histórico de alterações em cadastros
- Rastreabilidade de usuários e ações
- Backup automático de dados críticos

## 7. Integrações Necessárias

### 7.1. Consulta de CPF/CNPJ

- Integração com Receita Federal para validação
- Consulta de situação cadastral
- Verificação de regularidade

### 7.2. Sistema Bancário

- Consulta de dados bancários
- Validação de contas correntes
- Integração para compensação de cheques

### 7.3. Órgãos de Proteção ao Crédito

- Consulta SPC/Serasa
- Verificação de restrições
- Análise de score de crédito

### 7.4. Sistema de Notificações

- E-mail para comunicações
- SMS para avisos urgentes
- WhatsApp para contato direto

### 7.5. Busca de CEP

- Integração com viacep para busca de CEP

## 8. Segurança e Privacidade

### 8.1. Controle de Acesso

- Autenticação de usuários
- Autorização por perfis
- Controle de sessões
- Log de acessos

### 8.2. Proteção de Dados

- Criptografia de dados sensíveis
- Backup automático
- Conformidade com LGPD
- Retenção de dados conforme regulamentação

### 8.3. Auditoria

- Registro de todas as operações
- Trilha de auditoria completa
- Relatórios de conformidade
- Monitoramento de atividades suspeitas

## 9. Performance e Escalabilidade

### 9.1. Otimizações

- Índices em campos de busca frequente
- Cache para consultas recorrentes
- Otimização de queries complexas
- Compressão de arquivos antigos

### 9.2. Backup e Recuperação

- Backup incremental diário
- Backup completo semanal
- Plano de recuperação de desastres
- Testes regulares de restore

## 10. Considerações Técnicas

### 10.1. Validações

- Validação de CPF/CNPJ no frontend e backend
- Validação de e-mails e telefones
- Verificação de limites e restrições
- Consistência de dados relacionais

### 10.2. Cálculos

- Precisão decimal para valores monetários
- Arredondamento conforme normas bancárias
- Cálculo de juros compostos quando aplicável
- Controle de datas úteis vs. corridas

### 10.3. Usabilidade

- Interface intuitiva e responsiva
- Campos com autocomplete
- Máscaras para CPF, CNPJ, telefone
- Validação em tempo real
- Mensagens de erro claras
