# @movelabs Packages

Coleção de pacotes TypeScript para integração com APIs de serviços financeiros e corporativos brasileiros.

## 📦 Pacotes Disponíveis

### [@movelabs/api-direct-data](./api-direct-data)

Cliente TypeScript para a API de consulta de dados da Direct Data.

- **Funcionalidades**: Consulta de cadastro de pessoa física, telefones, endereços e emails
- **Tecnologias**: TypeScript, Axios, Zod

```bash
npm install @movelabs/api-direct-data
```

### [@movelabs/pix-sicoob](./pix-sicoob)

Cliente TypeScript/JavaScript para integração com a API PIX do Sicoob.

- **Funcionalidades**: Cobranças PIX, webhooks, QR codes, consultas de transações
- **Tecnologias**: TypeScript, Axios, Zod, autenticação via certificado PFX

```bash
npm install @movelabs/pix-sicoob
```

### [@movelabs/pontoweb](./pontoweb)

Cliente TypeScript para integração com a API do PontoWeb da Secullum.

- **Funcionalidades**: Consulta de funcionários, afastamentos e motivos de demissão
- **Tecnologias**: TypeScript, date-fns

```bash
npm install @movelabs/pontoweb
```

## 🚀 Características Gerais

- ✅ **Type-safe**: Totalmente tipado com TypeScript
- ✅ **Validação robusta**: Schemas Zod para validação de dados
- ✅ **Tratamento de erros**: Erros customizados com contexto
- ✅ **Documentação completa**: Exemplos de uso e referência da API
- ✅ **Compatibilidade**: Node.js 18+

## 📋 Pré-requisitos

- Node.js 18 ou superior
- TypeScript 5.0 ou superior

## 🔧 Instalação

Cada pacote pode ser instalado individualmente:

```bash
# Instalar apenas o pacote necessário
npm install @movelabs/api-direct-data
npm install @movelabs/pix-sicoob
npm install @movelabs/pontoweb

# Ou instalar múltiplos pacotes
npm install @movelabs/api-direct-data @movelabs/pix-sicoob @movelabs/pontoweb
```

## 🏗️ Desenvolvimento

### Estrutura do Projeto

```
packages/
├── api-direct-data/     # Cliente Direct Data
├── pix-sicoob/          # Cliente PIX Sicoob
├── pontoweb/            # Cliente PontoWeb
└── README.md            # Este arquivo
```

### Scripts Comuns

Cada pacote possui scripts padronizados:

```bash
# Compilar TypeScript
npm run build

# Desenvolvimento com watch
npm run dev

# Limpar arquivos compilados
npm run clean

# Preparar para publicação
npm run prepublishOnly
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca** commite credenciais ou certificados no código
2. Use variáveis de ambiente para informações sensíveis
3. Mantenha certificados PFX seguros (PIX Sicoob)
4. Valide sempre os dados de entrada
5. Use HTTPS para webhooks
6. Implemente rate limiting quando necessário

### Exemplo de Configuração Segura

```typescript
// ❌ Não faça isso
const client = new SicoobPixClient({
  clientId: 'meu-client-id',
  pfxPassword: 'senha123',
});

// ✅ Faça isso
const client = new SicoobPixClient({
  clientId: process.env.SICOOB_CLIENT_ID!,
  pfxBuffer: fs.readFileSync(process.env.SICOOB_CERT_PATH!),
  pfxPassword: process.env.SICOOB_CERT_PASSWORD!,
});
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Changelog

### Versão Atual (1.0.1)

- ✅ Todos os pacotes estáveis
- ✅ Documentação completa
- ✅ Validação robusta com Zod
- ✅ Suporte TypeScript completo

---

Feito com ❤️ pela equipe [MoveLabs](https://atendmais.com)
