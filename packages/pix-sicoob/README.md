# @movelabs/pix-sicoob

[![npm version](https://badge.fury.io/js/@movelabs%2Fpix-sicoob.svg)](https://badge.fury.io/js/@movelabs%2Fpix-sicoob)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cliente TypeScript/JavaScript para integração com a API PIX do Sicoob. Oferece uma interface simples e type-safe para criar cobranças, gerenciar webhooks e consultar transações PIX.

## 🚀 Características

- ✅ **Type-safe**: Totalmente tipado com TypeScript
- ✅ **Validação robusta**: Schemas Zod para validação de dados
- ✅ **Logs detalhados**: Sistema de logging configurável
- ✅ **Tratamento de erros**: Erros customizados com contexto
- ✅ **Interceptadores**: Logs automáticos de requisições/respostas
- ✅ **Health check**: Verificação de conectividade
- ✅ **Cache de token**: Gerenciamento automático de autenticação
- ✅ **Webhooks**: Suporte completo para notificações
- ✅ **QR Code**: Geração de imagens QR Code

## 📦 Instalação

```bash
npm install @movelabs/pix-sicoob
```

```bash
yarn add @movelabs/pix-sicoob
```

```bash
pnpm add @movelabs/pix-sicoob
```

## 🔧 Configuração

### Pré-requisitos

1. **Certificado PFX**: Certificado digital fornecido pelo Sicoob
2. **Client ID**: Identificador da aplicação no Sicoob
3. **Chave PIX**: Chave PIX cadastrada na sua conta

### Variáveis de Ambiente (Recomendado)

```env
SICOOB_CLIENT_ID=seu-client-id
SICOOB_CERT_PATH=/caminho/para/certificado.pfx
SICOOB_CERT_PASSWORD=senha-do-certificado
SICOOB_PIX_KEY=sua-chave-pix@email.com
```

## 🚀 Uso Básico

```typescript
import { SicoobPixClient } from "@movelabs/pix-sicoob";
import fs from "fs";

// Configurar cliente
const client = new SicoobPixClient({
  clientId: process.env.SICOOB_CLIENT_ID!,
  pfxBuffer: fs.readFileSync(process.env.SICOOB_CERT_PATH!),
  pfxPassword: process.env.SICOOB_CERT_PASSWORD!,
  scope: "cob.write cob.read webhook.read webhook.write",
  debug: true, // Habilitar logs (desenvolvimento)
});

// Criar cobrança PIX
const cobranca = await client.createPixCob({
  calendario: {
    expiracao: 3600, // 1 hora
  },
  valor: {
    original: "25.50",
  },
  chave: "sua-chave-pix@email.com",
  solicitacaoPagador: "Pagamento do pedido #12345",
});

console.log("Cobrança criada:", cobranca.txid);
console.log("BR Code:", cobranca.brcode);
```

## 📚 Documentação da API

### Configuração do Cliente

```typescript
interface SicoobAuthConfig {
  clientId: string; // ID do cliente fornecido pelo Sicoob
  pfxBuffer: Buffer; // Buffer do certificado PFX
  pfxPassword: string; // Senha do certificado PFX
  scope: string; // Escopo de acesso
  baseUrl?: string; // URL base da API (opcional)
  debug?: boolean; // Habilitar logs de debug
  logger?: Logger; // Logger customizado
}
```

### Métodos Disponíveis

#### 🔐 Autenticação

```typescript
// Obter token de acesso
const token = await client.getAccessToken();

// Verificar se token é válido
const isValid = client.isTokenValid();

// Obter informações do token
const tokenInfo = client.getTokenInfo();

// Invalidar token (forçar nova autenticação)
client.invalidateToken();

// Verificar conectividade
const isHealthy = await client.healthCheck();
```

#### 💰 Cobranças PIX

```typescript
// Criar cobrança
const cobranca = await client.createPixCob({
  calendario: { expiracao: 3600 },
  valor: { original: "10.50" },
  chave: "chave@pix.com",
  solicitacaoPagador: "Descrição do pagamento",
  devedor: {
    nome: "João Silva",
    cpf: "12345678901", // Opcional
  },
  infoAdicionais: [
    // Opcional
    { nome: "Produto", valor: "Curso Online" },
  ],
});

// Consultar cobrança
const cobrancaConsultada = await client.getPixCob("txid-da-cobranca");

// Obter QR Code como imagem
const imagemQR = await client.getPixCobImagem("txid-da-cobranca");
fs.writeFileSync("qrcode.png", imagemQR);

// Listar cobranças
const lista = await client.listPix({
  inicio: "2025-01-01T00:00:00Z",
  fim: "2025-01-31T23:59:59Z",
  status: "ATIVA",
  "paginacao.paginaAtual": 0,
  "paginacao.itensPorPagina": 50,
});
```

#### 🔗 Webhooks

```typescript
// Configurar webhook
await client.setWebhook(
  "sua-chave-pix@email.com",
  "https://seu-site.com/webhook/pix",
);

// Consultar webhook
const webhook = await client.getWebhook("sua-chave-pix@email.com");

// Remover webhook
await client.deleteWebhook("sua-chave-pix@email.com");
```

## 🎯 Exemplos Avançados

### Logger Customizado

```typescript
import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

const client = new SicoobPixClient({
  // ... outras configurações
  debug: false,
  logger: logger,
});
```

### Tratamento de Erros

```typescript
import {
  SicoobPixError,
  SicoobAuthError,
  SicoobValidationError,
} from "@movelabs/pix-sicoob";

try {
  const cobranca = await client.createPixCob(dadosCobranca);
} catch (error) {
  if (error instanceof SicoobAuthError) {
    console.error("Erro de autenticação:", error.message);
  } else if (error instanceof SicoobValidationError) {
    console.error("Dados inválidos:", error.details);
  } else if (error instanceof SicoobPixError) {
    console.error("Erro na API PIX:", error.code, error.status);
  }
}
```

### Processamento de Webhook

```typescript
import express from "express";
import { webhookPixPayloadSchema } from "@movelabs/pix-sicoob";

const app = express();
app.use(express.json());

app.post("/webhook/pix", (req, res) => {
  try {
    // Validar payload do webhook
    const payload = webhookPixPayloadSchema.parse(req.body);

    // Processar cada PIX recebido
    payload.pix.forEach((pix) => {
      console.log("PIX recebido:", {
        txid: pix.txid,
        valor: pix.valor,
        pagador: pix.nomePagador,
        horario: pix.horario,
      });

      // Aqui você processaria o pagamento na sua aplicação
      processarPagamento(pix);
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(400).json({ error: "Payload inválido" });
  }
});
```

## 🏗️ Tipos e Schemas

### Principais Tipos

```typescript
// Payload para criar cobrança
interface CobPayload {
  calendario: {
    expiracao: number;
    criacao?: string;
  };
  valor: {
    original: string; // Formato: "10.50"
    modalidadeAlteracao?: 0 | 1;
  };
  chave: string;
  txid?: string;
  solicitacaoPagador?: string;
  devedor?: {
    nome: string;
    cpf?: string;
    cnpj?: string;
  };
  infoAdicionais?: Array<{
    nome: string;
    valor: string;
  }>;
}

// Resposta da cobrança
interface CobResponse {
  txid: string;
  revisao: number;
  location: string;
  status:
    | "ATIVA"
    | "CONCLUIDA"
    | "REMOVIDA_PELO_USUARIO_RECEBEDOR"
    | "REMOVIDA_PELO_PSP";
  calendario: {
    criacao?: string;
    expiracao: number;
  };
  valor: {
    original: string;
  };
  chave: string;
  brcode: string;
  // ... outros campos
}
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca** commite certificados ou senhas no código
2. Use variáveis de ambiente para credenciais
3. Mantenha o certificado PFX seguro
4. Valide sempre os webhooks recebidos
5. Use HTTPS para webhooks
6. Implemente rate limiting
7. Monitore logs de erro

### Exemplo de Configuração Segura

```typescript
// ❌ Não faça isso
const client = new SicoobPixClient({
  clientId: "meu-client-id",
  pfxPassword: "senha123",
  // ...
});

// ✅ Faça isso
const client = new SicoobPixClient({
  clientId: process.env.SICOOB_CLIENT_ID!,
  pfxBuffer: fs.readFileSync(process.env.SICOOB_CERT_PATH!),
  pfxPassword: process.env.SICOOB_CERT_PASSWORD!,
  scope: process.env.SICOOB_SCOPE!,
  debug: process.env.NODE_ENV !== "production",
});
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Certificado

```
Error: unable to verify the first certificate
```

**Solução**: Verifique se o certificado PFX está correto e a senha está correta.

#### Erro de Autenticação

```
SicoobAuthError: Erro ao obter token de acesso
```

**Soluções**:

- Verifique o `clientId`
- Confirme o escopo (`scope`)
- Verifique se o certificado não expirou

#### Erro de Validação

```
SicoobValidationError: Dados inválidos para cobrança PIX
```

**Soluções**:

- Verifique o formato do valor (ex: "10.50")
- Confirme se a chave PIX está correta
- Valide CPF/CNPJ se fornecidos

### Debug

Habilite logs detalhados:

```typescript
const client = new SicoobPixClient({
  // ... configurações
  debug: true,
});
```

## 📝 Changelog

### v1.0.0

- ✨ Versão inicial
- ✅ Suporte completo à API PIX Sicoob
- ✅ Validação com Zod
- ✅ Tipos TypeScript
- ✅ Sistema de logs
- ✅ Tratamento de erros
- ✅ Suporte a webhooks

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Documentação oficial da API PIX Sicoob](https://developers.sicoob.com.br)
- [Especificação PIX do Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix)
- [Repositório no GitHub](https://github.com/movelabs/pix-sicoob)

## 📞 Suporte

- 📧 Email: suporte@movelabs.com
- 🐛 Issues: [GitHub Issues](https://github.com/movelabs/pix-sicoob/issues)
- 📖 Documentação: [Wiki](https://github.com/movelabs/pix-sicoob/wiki)

---

Feito com ❤️ pela equipe [ZapTickets](https://movelabs.com)
