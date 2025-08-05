const fs = require('fs');

// Dados base
const unidades = [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 26, 27, 28, 123];
const usuarios = [
  'jrvidotti@gmail.com',
  'aprovador_almoxarifado@x.com', 
  'gerencia_almoxarifado@x.com',
  'usuario_almoxarifado@x.com'
];

const materiais = [
  // EMB_PADRAO
  { id: 1, tipoMaterialId: "EMB_PADRAO", nome: "Sacola MV - PP", unidadeMedidaId: "FD" },
  { id: 2, tipoMaterialId: "EMB_PADRAO", nome: "Sacola MV - P", unidadeMedidaId: "FD" },
  { id: 3, tipoMaterialId: "EMB_PADRAO", nome: "Sacola MV - M", unidadeMedidaId: "FD" },
  { id: 4, tipoMaterialId: "EMB_PADRAO", nome: "Sacola MV - G", unidadeMedidaId: "FD" },
  { id: 5, tipoMaterialId: "EMB_PADRAO", nome: "Sacola MV - GG", unidadeMedidaId: "FD" },
  
  // EMB_PRESENTE
  { id: 6, tipoMaterialId: "EMB_PRESENTE", nome: "Emb Presente PP - M3: 25x37cm", unidadeMedidaId: "PCT" },
  { id: 7, tipoMaterialId: "EMB_PRESENTE", nome: "Emb Presente P - M4: 30x44cm", unidadeMedidaId: "PCT" },
  { id: 8, tipoMaterialId: "EMB_PRESENTE", nome: "Emb Presente M - G1: 35x54cm", unidadeMedidaId: "PCT" },
  { id: 9, tipoMaterialId: "EMB_PRESENTE", nome: "Emb Presente G - G2: 45x59cm", unidadeMedidaId: "PCT" },
  { id: 10, tipoMaterialId: "EMB_PRESENTE", nome: "Emb Presente GG: 58x89cm", unidadeMedidaId: "PCT" },
  
  // EMB_VENDA
  { id: 11, tipoMaterialId: "EMB_VENDA", nome: "Sacola Preta - P", unidadeMedidaId: "FD" },
  { id: 12, tipoMaterialId: "EMB_VENDA", nome: "Sacola Preta - M", unidadeMedidaId: "FD" },
  { id: 13, tipoMaterialId: "EMB_VENDA", nome: "Sacola Preta - G", unidadeMedidaId: "FD" },
  { id: 14, tipoMaterialId: "EMB_VENDA", nome: "Sacola Branca - P", unidadeMedidaId: "FD" },
  { id: 15, tipoMaterialId: "EMB_VENDA", nome: "Sacola Branca - M", unidadeMedidaId: "FD" },
  { id: 16, tipoMaterialId: "EMB_VENDA", nome: "Sacola Branca - G", unidadeMedidaId: "FD" },
  
  // MAT_COZINHA
  { id: 17, tipoMaterialId: "MAT_COZINHA", nome: "Açúcar", unidadeMedidaId: "KG" },
  { id: 18, tipoMaterialId: "MAT_COZINHA", nome: "Café", unidadeMedidaId: "KG" },
  { id: 19, tipoMaterialId: "MAT_COZINHA", nome: "Chá Mate", unidadeMedidaId: "KG" },
  { id: 20, tipoMaterialId: "MAT_COZINHA", nome: "Copo Plástico 200ml", unidadeMedidaId: "PCT" },
  { id: 21, tipoMaterialId: "MAT_COZINHA", nome: "Copo Plástico 50ml", unidadeMedidaId: "PCT" },
  { id: 22, tipoMaterialId: "MAT_COZINHA", nome: "Coador P", unidadeMedidaId: "UN" },
  { id: 23, tipoMaterialId: "MAT_COZINHA", nome: "Coador M", unidadeMedidaId: "UN" },
  
  // MAT_ESCRITORIO (alguns principais)
  { id: 24, tipoMaterialId: "MAT_ESCRITORIO", nome: "Grampo", unidadeMedidaId: "CX" },
  { id: 25, tipoMaterialId: "MAT_ESCRITORIO", nome: "Fix Pin Antifurto Pino Tag 40mm", unidadeMedidaId: "CX" },
  { id: 26, tipoMaterialId: "MAT_ESCRITORIO", nome: "Trava Anel 450mm", unidadeMedidaId: "CX" },
  { id: 27, tipoMaterialId: "MAT_ESCRITORIO", nome: "Capa de Carnê", unidadeMedidaId: "PCT" },
  { id: 28, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bobina Termica - Bematech", unidadeMedidaId: "RL" },
  { id: 29, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta de Promoção", unidadeMedidaId: "RL" },
  { id: 30, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta Troca", unidadeMedidaId: "RL" },
  { id: 31, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta Presente", unidadeMedidaId: "RL" },
  { id: 32, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta de Preço", unidadeMedidaId: "RM" },
  { id: 33, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta Vitrine", unidadeMedidaId: "RM" },
  { id: 34, tipoMaterialId: "MAT_ESCRITORIO", nome: "Etiqueta Perfume", unidadeMedidaId: "RM" },
  { id: 35, tipoMaterialId: "MAT_ESCRITORIO", nome: "Placa de Acrilico / Fechado", unidadeMedidaId: "UN" },
  { id: 36, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caderno Grande / Folga", unidadeMedidaId: "UN" },
  { id: 37, tipoMaterialId: "MAT_ESCRITORIO", nome: "Tinta p/ Carimbo", unidadeMedidaId: "UN" },
  { id: 38, tipoMaterialId: "MAT_ESCRITORIO", nome: "Apontador", unidadeMedidaId: "UN" },
  { id: 39, tipoMaterialId: "MAT_ESCRITORIO", nome: "Borracha", unidadeMedidaId: "UN" },
  { id: 40, tipoMaterialId: "MAT_ESCRITORIO", nome: "Lápis", unidadeMedidaId: "UN" },
  { id: 41, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caneta", unidadeMedidaId: "UN" },
  { id: 42, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caneta Marca-texto", unidadeMedidaId: "UN" },
  { id: 43, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caneta p/Vitrine Preta", unidadeMedidaId: "UN" },
  { id: 44, tipoMaterialId: "MAT_ESCRITORIO", nome: "Pincel Atômico", unidadeMedidaId: "UN" },
  { id: 45, tipoMaterialId: "MAT_ESCRITORIO", nome: "Corretivo Liquido", unidadeMedidaId: "UN" },
  { id: 46, tipoMaterialId: "MAT_ESCRITORIO", nome: "Grampeador", unidadeMedidaId: "UN" },
  { id: 47, tipoMaterialId: "MAT_ESCRITORIO", nome: "Calculadora", unidadeMedidaId: "UN" },
  { id: 48, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caderno", unidadeMedidaId: "UN" },
  { id: 49, tipoMaterialId: "MAT_ESCRITORIO", nome: "Caixa Arquivo", unidadeMedidaId: "UN" },
  { id: 50, tipoMaterialId: "MAT_ESCRITORIO", nome: "Papel Sulfite A4", unidadeMedidaId: "UN" },
  { id: 51, tipoMaterialId: "MAT_ESCRITORIO", nome: "Envelope Plastico", unidadeMedidaId: "UN" },
  { id: 52, tipoMaterialId: "MAT_ESCRITORIO", nome: "Pasta Elastica", unidadeMedidaId: "UN" },
  { id: 53, tipoMaterialId: "MAT_ESCRITORIO", nome: "Cola Branca", unidadeMedidaId: "UN" },
  { id: 54, tipoMaterialId: "MAT_ESCRITORIO", nome: "Adesivo Instantâneo", unidadeMedidaId: "UN" },
  { id: 55, tipoMaterialId: "MAT_ESCRITORIO", nome: "Aplicador Cola Quente", unidadeMedidaId: "UN" },
  { id: 56, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bastão de Cola Quente", unidadeMedidaId: "UN" },
  { id: 57, tipoMaterialId: "MAT_ESCRITORIO", nome: "Cartão Visita", unidadeMedidaId: "UN" },
  { id: 58, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bloco de Nota Promissória", unidadeMedidaId: "UN" },
  { id: 59, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bloco de Recibo", unidadeMedidaId: "UN" },
  { id: 60, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bloco de Orçamento", unidadeMedidaId: "UN" },
  { id: 61, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bloco de Transferência", unidadeMedidaId: "UN" },
  { id: 62, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bloco de Confronto", unidadeMedidaId: "UN" },
  { id: 63, tipoMaterialId: "MAT_ESCRITORIO", nome: "Carbono", unidadeMedidaId: "UN" },
  { id: 64, tipoMaterialId: "MAT_ESCRITORIO", nome: "Bobina Biométrica - Ponto", unidadeMedidaId: "UN" },
  { id: 65, tipoMaterialId: "MAT_ESCRITORIO", nome: "Agulha p/ Aplicador Tag", unidadeMedidaId: "UN" },
  { id: 66, tipoMaterialId: "MAT_ESCRITORIO", nome: "Aplicador Tag", unidadeMedidaId: "UN" },
  { id: 67, tipoMaterialId: "MAT_ESCRITORIO", nome: "Estilete", unidadeMedidaId: "UN" },
  { id: 68, tipoMaterialId: "MAT_ESCRITORIO", nome: "Lamina", unidadeMedidaId: "UN" },
  { id: 69, tipoMaterialId: "MAT_ESCRITORIO", nome: "Fita Larga 48x100mm", unidadeMedidaId: "UN" },
  { id: 70, tipoMaterialId: "MAT_ESCRITORIO", nome: "Barbante (M)", unidadeMedidaId: "UN" },
  { id: 71, tipoMaterialId: "MAT_ESCRITORIO", nome: "Linha de Anzol", unidadeMedidaId: "UN" },
  { id: 72, tipoMaterialId: "MAT_ESCRITORIO", nome: "Fitilhos", unidadeMedidaId: "UN" },
  { id: 73, tipoMaterialId: "MAT_ESCRITORIO", nome: "Laço", unidadeMedidaId: "UN" },
  { id: 74, tipoMaterialId: "MAT_ESCRITORIO", nome: "Suporte Durex", unidadeMedidaId: "UN" },
  { id: 75, tipoMaterialId: "MAT_ESCRITORIO", nome: "Fita Adesiva 12x40mm", unidadeMedidaId: "UN" },
  { id: 76, tipoMaterialId: "MAT_ESCRITORIO", nome: "Tesoura", unidadeMedidaId: "UN" },
  
  // MAT_LIMPEZA
  { id: 77, tipoMaterialId: "MAT_LIMPEZA", nome: "Cesto P/ Lixo", unidadeMedidaId: "PCT" },
  { id: 78, tipoMaterialId: "MAT_LIMPEZA", nome: "Saco de lixo (tamanho P)", unidadeMedidaId: "PCT" },
  { id: 79, tipoMaterialId: "MAT_LIMPEZA", nome: "Papel Higienico", unidadeMedidaId: "PCT" },
  { id: 80, tipoMaterialId: "MAT_LIMPEZA", nome: "Papel Toalha", unidadeMedidaId: "PCT" },
  { id: 81, tipoMaterialId: "MAT_LIMPEZA", nome: "Agua Sanitária", unidadeMedidaId: "UN" },
  { id: 82, tipoMaterialId: "MAT_LIMPEZA", nome: "Álcool", unidadeMedidaId: "UN" },
  { id: 83, tipoMaterialId: "MAT_LIMPEZA", nome: "Desinfetante", unidadeMedidaId: "UN" },
  { id: 84, tipoMaterialId: "MAT_LIMPEZA", nome: "Detergente", unidadeMedidaId: "UN" }
];

const statusOptions = ['PENDENTE', 'APROVADA', 'ATENDIDA', 'CANCELADA'];
const statusDistribution = [
  ...Array(20).fill('PENDENTE'),
  ...Array(15).fill('APROVADA'), 
  ...Array(60).fill('ATENDIDA'),
  ...Array(5).fill('CANCELADA')
];

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function generateSolicitacao(index) {
  const status = statusDistribution[Math.floor(Math.random() * statusDistribution.length)];
  const solicitante = usuarios[Math.floor(Math.random() * usuarios.length)];
  const unidade = unidades[Math.floor(Math.random() * unidades.length)];
  
  // Data base (últimos 6 meses)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const dataOperacao = getRandomDate(startDate, new Date());
  
  let dataAprovacao = null;
  let dataAtendimento = null;
  let aprovador = null;
  let atendidoPor = null;
  
  if (status === 'APROVADA' || status === 'ATENDIDA') {
    dataAprovacao = addHours(dataOperacao, Math.random() * 48); // 0-48h após operação
    aprovador = usuarios.find(u => u.includes('aprovador')) || usuarios[1];
  }
  
  if (status === 'ATENDIDA') {
    dataAtendimento = addHours(new Date(dataAprovacao), Math.random() * 72); // 0-72h após aprovação
    atendidoPor = usuarios.find(u => u.includes('gerencia')) || usuarios[2];
  }
  
  // Gerar itens (1-5 materiais por solicitação)
  const numItens = Math.floor(Math.random() * 5) + 1;
  const materiaisEscolhidos = [];
  const itens = [];
  
  for (let i = 0; i < numItens; i++) {
    let material;
    do {
      material = materiais[Math.floor(Math.random() * materiais.length)];
    } while (materiaisEscolhidos.includes(material.id));
    
    materiaisEscolhidos.push(material.id);
    
    const qtdSolicitada = Math.floor(Math.random() * 10) + 1;
    const qtdAtendida = status === 'ATENDIDA' ? Math.floor(Math.random() * qtdSolicitada) + 1 : 
                      (status === 'PENDENTE' || status === 'CANCELADA' ? 0 : qtdSolicitada);
    
    itens.push({
      id: index * 10 + i + 1,
      solicitacaoMaterialId: index + 3,
      materialId: material.id,
      qtdSolicitada,
      qtdAtendida,
      criadoEm: dataOperacao.toISOString().replace('T', ' ').slice(0, 19),
      atualizadoEm: (dataAtendimento || dataAprovacao || dataOperacao).toISOString(),
      material: {
        tipoMaterialId: material.tipoMaterialId,
        nome: material.nome,
        unidadeMedidaId: material.unidadeMedidaId
      }
    });
  }
  
  return {
    dataOperacao: dataOperacao.toISOString(),
    dataAprovacao: dataAprovacao ? dataAprovacao.toISOString() : null,
    dataAtendimento: dataAtendimento ? dataAtendimento.toISOString() : null,
    status,
    observacoes: Math.random() > 0.7 ? `Observação para solicitação ${index + 3}` : "",
    solicitante: { email: solicitante },
    unidade: { codigo: unidade },
    aprovador: aprovador ? { email: aprovador } : null,
    atendidoPor: atendidoPor ? { email: atendidoPor } : null,
    itens
  };
}

// Ler arquivo existente
const arquivoExistente = JSON.parse(fs.readFileSync('/home/junior/gestaomv-ts/gestaomv/data/solicitacoes.json', 'utf8'));

// Gerar 100 novas solicitações
const novasSolicitacoes = [];
for (let i = 0; i < 100; i++) {
  novasSolicitacoes.push(generateSolicitacao(i));
}

// Combinar com dados existentes
const dadosCombinados = {
  metadata: {
    exportadoEm: new Date().toISOString(),
    totalRegistros: 102,
    versao: "1.0.0",
    descricao: "Dados de solicitacoes para seed"
  },
  dados: [...arquivoExistente.dados, ...novasSolicitacoes]
};

// Salvar arquivo
fs.writeFileSync('/home/junior/gestaomv-ts/gestaomv/data/solicitacoes.json', JSON.stringify(dadosCombinados, null, 2));

console.log('Arquivo gerado com sucesso! 102 solicitações no total.');