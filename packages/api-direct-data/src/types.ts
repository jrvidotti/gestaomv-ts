import { z } from "zod";

// Interface para logger customizado (compatível com Pino)
export interface Logger {
	debug(obj: any, msg?: string): void;
	info(obj: any, msg?: string): void;
	warn(obj: any, msg?: string): void;
	error(obj: any, msg?: string): void;
}

// Configuração do cliente
export interface ApiDirectDataConfig {
	token: string;
	baseUrl?: string;
	timeout?: number;
	debug?: boolean;
	logger?: Logger; // Logger opcional
}

// Schemas de validação
export const cadastroPessoaFisicaQuerySchema = z.object({
	cpf: z.string().min(1, "CPF é obrigatório"),
});

export const cadastroPessoaJuridicaQuerySchema = z.object({
	cnpj: z.string().min(1, "CNPJ é obrigatório"),
});

// Tipos de entrada
export type CadastroPessoaFisicaQuery = z.infer<
	typeof cadastroPessoaFisicaQuerySchema
>;

export type CadastroPessoaJuridicaQuery = z.infer<
	typeof cadastroPessoaJuridicaQuerySchema
>;

// Tipos de dados
export interface Telefone {
	telefoneComDDD?: string | null;
	telemarketingBloqueado?: boolean | null;
	operadora?: string | null;
	tipoTelefone?: string | null;
	whatsApp?: boolean | null;
}

export interface Endereco {
	logradouro?: string | null;
	numero?: string | null;
	complemento?: string | null;
	bairro?: string | null;
	cidade?: string | null;
	uf?: string | null;
	cep?: string | null;
}

export interface Email {
	enderecoEmail?: string | null;
}

export interface MetaDados {
	consultaNome?: string | null;
	consultaUid?: string | null;
	chave?: string | null;
	usuario?: string | null;
	mensagem?: string | null;
	ip?: string | null;
	resultadoId: number;
	resultado?: string | null;
	apiVersao?: string | null;
	gerarComprovante: boolean;
	urlComprovante?: string | null;
	assincrono: boolean;
	data?: string | null;
	tempoExecucaoMs: number;
}

export interface CadastroPessoaFisica {
	cpf?: string | null;
	nome?: string | null;
	sexo?: string | null;
	dataNascimento?: string | null;
	nomeMae?: string | null;
	idade?: number | null;
	signo?: string | null;
	telefones?: Telefone[] | null;
	enderecos?: Endereco[] | null;
	emails?: Email[] | null;
	rendaEstimada?: string | null;
	rendaFaixaSalarial?: string | null;
}

export interface Socio {
	documento?: string | null;
	nome?: string | null;
	percentualParticipacao?: number | null;
	dataEntrada?: string | null;
	cargo?: string | null;
}

export interface CnaeSecundario {
	codigo?: number | null;
	descricao?: string | null;
}

export interface CadastroPessoaJuridica {
	cnpj?: string | null;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	dataFundacao?: string | null;
	cnaeCodigo?: number | null;
	cnaeDescricao?: string | null;
	cnaEsSecundarios?: CnaeSecundario[] | null;
	quantidadeFuncionarios?: number | null;
	situacaoCadastral?: string | null;
	naturezaJuridicaCodigo?: number | null;
	naturezaJuridicaDescricao?: string | null;
	naturezaJuridicaTipo?: string | null;
	porte?: string | null;
	faixaFuncionarios?: string | null;
	faixaFaturamento?: string | null;
	matriz?: boolean | null;
	orgaoPublico?: string | null;
	ramo?: string | null;
	tipoEmpresa?: string | null;
	telefones?: Telefone[] | null;
	enderecos?: Endereco[] | null;
	emails?: Email[] | null;
	ultimaAtualizacaoPJ?: string | null;
	socios?: Socio[] | null;
}

// Tipos de resposta
export interface CadastroPessoaFisicaResponse {
	metaDados?: MetaDados;
	retorno?: CadastroPessoaFisica;
}

export interface CadastroPessoaJuridicaResponse {
	metaDados?: MetaDados;
	retorno?: CadastroPessoaJuridica;
}
