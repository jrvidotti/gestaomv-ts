import { SicoobPixClient } from "./src/index";
import fs from "fs";

// Exemplo de uso do cliente PIX Sicoob
async function exemploUso() {
  try {
    // 1. Configurar o cliente
    const client = new SicoobPixClient({
      clientId: "seu-client-id-aqui",
      pfxBuffer: fs.readFileSync("caminho/para/certificado.pfx"),
      pfxPassword: "senha-do-certificado",
      scope: "cob.write cob.read webhook.read webhook.write",
      debug: true, // Habilitar logs detalhados
    });

    console.log("🚀 Cliente PIX Sicoob configurado com sucesso!");

    // 2. Obter informações do token
    const tokenInfo = client.getTokenInfo();
    if (tokenInfo) {
      console.log("🔑 Token info:", {
        tipo: tokenInfo.token_type,
        escopo: tokenInfo.scope,
        expiraEm: tokenInfo.expiresAt.toISOString(),
        valido: tokenInfo.isValid,
      });
    }

    // 3. Criar uma cobrança PIX
    console.log("\n📝 Criando cobrança PIX...");
    const cobranca = await client.createPixCob({
      calendario: {
        expiracao: 3600, // 1 hora
      },
      valor: {
        original: "25.50",
      },
      chave: "sua-chave-pix@email.com",
      solicitacaoPagador: "Pagamento do pedido #12345",
      devedor: {
        nome: "João Silva",
        cpf: "12345678901",
      },
      infoAdicionais: [
        {
          nome: "Produto",
          valor: "Curso de JavaScript",
        },
        {
          nome: "Desconto",
          valor: "10%",
        },
      ],
    });

    console.log("✅ Cobrança criada:", {
      txid: cobranca.txid,
      valor: cobranca.valor.original,
      status: cobranca.status,
      brcode: cobranca.brcode.substring(0, 50) + "...",
      location: cobranca.location,
    });

    // 4. Consultar a cobrança criada
    console.log("\n🔍 Consultando cobrança...");
    const cobrancaConsultada = await client.getPixCob(cobranca.txid);
    console.log("📋 Status da cobrança:", cobrancaConsultada.status);

    // 6. Obter imagem QR Code
    console.log("\n🖼️ Obtendo imagem QR Code...");
    const imagemQR = await client.getPixCobImagem(cobranca.txid);

    // 7. Configurar webhook (opcional)
    console.log("\n🔗 Configurando webhook...");
    await client.setWebhook(
      "sua-chave-pix@email.com",
      "https://seu-site.com/webhook/pix",
    );
    console.log("✅ Webhook configurado");

    // 8. Consultar webhook
    const webhook = await client.getWebhook("sua-chave-pix@email.com");
    console.log("🔗 Webhook atual:", webhook.webhookUrl);

    // 9. Listar cobranças do período
    console.log("\n📊 Listando cobranças do último mês...");
    const agora = new Date();
    const umMesAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const lista = await client.listPix({
      inicio: umMesAtras.toISOString(),
      fim: agora.toISOString(),
      status: "ATIVA",
      "paginacao.paginaAtual": 0,
      "paginacao.itensPorPagina": 10,
    });

    console.log("📋 Cobranças encontradas:", lista.cobs.length);
    console.log(
      "📄 Total de páginas:",
      lista.parametros.paginacao.quantidadeDePaginas,
    );
    console.log(
      "📊 Total de itens:",
      lista.parametros.paginacao.quantidadeTotalDeItens,
    );

    // 10. Exemplo de tratamento de webhook
    console.log("\n🎯 Exemplo de processamento de webhook:");
    exemploWebhook();
  } catch (error) {
    console.error("❌ Erro:", error);

    // Tratamento específico de erros
    if (error.name === "SicoobAuthError") {
      console.error("🔐 Erro de autenticação - verifique suas credenciais");
    } else if (error.name === "SicoobValidationError") {
      console.error("📝 Erro de validação - verifique os dados enviados");
    } else if (error.name === "SicoobPixError") {
      console.error("💳 Erro na API PIX - verifique a documentação");
    }
  }
}

// Exemplo de processamento de webhook
function exemploWebhook() {
  // Simulação de payload recebido do webhook
  const webhookPayload = {
    pix: [
      {
        endToEndId: "E0000000020250429165342751287687",
        txid: "TR32QW5QQBDTZL036328721745945595545",
        valor: "25.50",
        horario: "2025-01-27T10:30:00.000Z",
        nomePagador: "Maria Santos",
        pagador: {
          nome: "Maria Santos",
          cpf: "98765432100",
        },
        devolucoes: [],
      },
    ],
  };

  console.log("📨 Webhook recebido:");
  webhookPayload.pix.forEach((pix, index) => {
    console.log(`  PIX ${index + 1}:`);
    console.log(`    💰 Valor: R$ ${pix.valor}`);
    console.log(`    👤 Pagador: ${pix.nomePagador}`);
    console.log(
      `    🕒 Horário: ${new Date(pix.horario).toLocaleString("pt-BR")}`,
    );
    console.log(`    🔗 TXID: ${pix.txid}`);
    console.log(`    🆔 End-to-End: ${pix.endToEndId}`);
  });
}

// Exemplo de uso com logger customizado (Pino)
function exemploComLogger() {
  // Simulação de logger compatível com Pino
  const logger = {
    debug: (obj: any, msg?: string) => console.log(`[DEBUG] ${msg}`, obj),
    info: (obj: any, msg?: string) => console.log(`[INFO] ${msg}`, obj),
    warn: (obj: any, msg?: string) => console.warn(`[WARN] ${msg}`, obj),
    error: (obj: any, msg?: string) => console.error(`[ERROR] ${msg}`, obj),
  };

  const client = new SicoobPixClient({
    clientId: "seu-client-id-aqui",
    pfxBuffer: fs.readFileSync("caminho/para/certificado.pfx"),
    pfxPassword: "senha-do-certificado",
    scope: "cob.write cob.read webhook.read webhook.write",
    debug: false, // Desabilitar logs internos
    logger: logger, // Usar logger customizado
  });

  console.log("📝 Cliente configurado com logger customizado");
  return client;
}

// Exemplo de uso em produção
function exemploProducao() {
  const client = new SicoobPixClient({
    clientId: process.env.SICOOB_CLIENT_ID!,
    pfxBuffer: fs.readFileSync(process.env.SICOOB_CERT_PATH!),
    pfxPassword: process.env.SICOOB_CERT_PASSWORD!,
    scope: "cob.write cob.read webhook.read webhook.write",
    baseUrl: "https://api.sicoob.com.br/pix/api/v2", // URL de produção
    debug: false, // Desabilitar logs em produção
  });

  console.log("🏭 Cliente configurado para produção");
  return client;
}

// Executar exemplo se arquivo for executado diretamente
if (require.main === module) {
  console.log("🎯 Executando exemplo PIX Sicoob...\n");
  exemploUso().catch(console.error);
}

export { exemploUso, exemploWebhook, exemploComLogger, exemploProducao };
