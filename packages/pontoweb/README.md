# PontoWeb Client

Cliente TypeScript para integração com a API do PontoWeb da Secullum.

## Instalação

```bash
npm install @movelabs/pontoweb
```

## Uso

### Inicialização

```typescript
import { PontoWebClient } from '@movelabs/pontoweb'

// Inicializar o cliente com credenciais
const client = await PontoWebClient.init('seu_usuario', 'sua_senha')
```

### Listar Funcionários

```typescript
const funcionarios = await client.listaFuncionarios()
console.log(funcionarios)
```

### Listar Afastamentos

```typescript
// Buscar afastamentos dos últimos 30 dias
const afastamentos = await client.listaAfastamentos(30)
console.log(afastamentos)
```

### Listar Motivos de Demissão

```typescript
const motivosDemissao = await client.listMotivosDemissao()
console.log(motivosDemissao)
```

## Tipos

O pacote exporta os seguintes tipos TypeScript:

- `Funcionario`: Interface para dados de funcionários
- `Afastamento`: Interface para dados de afastamentos
- `MotivoDemissao`: Interface para motivos de demissão

## Exemplo Completo

```typescript
import { PontoWebClient, type Funcionario } from '@movelabs/pontoweb'

async function main() {
	try {
		// Inicializar cliente
		const client = await PontoWebClient.init('usuario', 'senha')

		// Buscar funcionários
		const funcionarios: Funcionario[] = await client.listaFuncionarios()

		// Buscar afastamentos dos últimos 7 dias
		const afastamentos = await client.listaAfastamentos(7)

		console.log(`Encontrados ${funcionarios.length} funcionários`)
		console.log(`Encontrados ${afastamentos.length} afastamentos`)
	} catch (error) {
		console.error('Erro:', error)
	}
}

main()
```

## Licença

MIT
