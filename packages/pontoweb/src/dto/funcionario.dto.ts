export interface Funcionario {
	Id: number
	Nome: string
	Cpf: string
	Rg?: string
	ExpedicaoRg?: Date
	Nascimento?: Date
	Admissao?: Date
	Demissao?: Date
	DataUltimoEnvio?: Date
	DataAlteracao?: Date
	MotivoDemissaoId?: number
	MotivoDemissao?: string
	Email?: string
	Telefone?: string
	Endereco?: string
	Cargo?: string
	Salario?: number
	Ativo: boolean
}
