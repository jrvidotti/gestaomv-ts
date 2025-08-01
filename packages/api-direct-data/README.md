# Client API Direct Data

Cliente TypeScript para a API de consulta de dados da Direct Data.

## Instalação

```bash
npm install @movelabs/api-direct-data
```

## Uso

### Configuração Básica

```typescript
import { ConsultaDadosClient } from '@movelabs/api-direct-data'

const client = new ConsultaDadosClient({
	baseUrl: 'https://api.directdata.com.br', // opcional, padrão
	token: 'seu-token-aqui', // obrigatório
	timeout: 30000, // opcional, padrão 30 segundos
	debug: false, // opcional, padrão false
})
```

### Consulta de Cadastro - Pessoa Física - Básica

```typescript
try {
	const resultado = await client.consultarCadastroPessoaFisica({
		cpf: '12345678901',
		token: 'seu-token-aqui',
	})

	console.log('Dados da pessoa:', resultado.retorno)
	console.log('Metadados:', resultado.metaDados)
} catch (error) {
	console.error('Erro na consulta:', error.message)
}
```

## Tipos de Dados

### CadastroPessoaFisica

```typescript
interface CadastroPessoaFisica {
	cpf?: string | null
	nome?: string | null
	sexo?: string | null
	dataNascimento?: string | null
	nomeMae?: string | null
	idade?: number | null
	signo?: string | null
	telefones?: Telefone[] | null
	enderecos?: Endereco[] | null
	emails?: Email[] | null
	rendaEstimada?: string | null
	rendaFaixaSalarial?: string | null
}
```

### Telefone

```typescript
interface Telefone {
	telefoneComDDD?: string | null
	telemarketingBloqueado?: boolean | null
	operadora?: string | null
	tipoTelefone?: string | null
	whatsApp?: boolean | null
}
```

### Endereco

```typescript
interface Endereco {
	logradouro?: string | null
	numero?: string | null
	complemento?: string | null
	bairro?: string | null
	cidade?: string | null
	uf?: string | null
	cep?: string | null
}
```

### Email

```typescript
interface Email {
	enderecoEmail?: string | null
}
```

## Tratamento de Erros

O cliente trata automaticamente os seguintes tipos de erro:

- **Dados inválidos**: Quando os parâmetros de entrada não passam na validação
- **Erros da API**: Quando a API retorna erro (401, 403, 404, etc.)
- **Timeout**: Quando a requisição excede o tempo limite
- **Erros de rede**: Problemas de conectividade

Todos os erros são lançados como `Error` com mensagens descritivas.

## Debug

Para habilitar logs de debug:

```typescript
const client = new ConsultaDadosClient({
	debug: true,
})
```

Isso irá imprimir no console:

- Parâmetros enviados nas requisições
- Respostas de erro da API
- Informações sobre falhas de validação

## Licença

MIT
