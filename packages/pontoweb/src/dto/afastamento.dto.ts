export interface Afastamento {
	Id: number
	FuncionarioId: number
	Inicio?: Date
	Fim?: Date
	DataInclusao?: Date
	Motivo?: string
	Observacao?: string
	Tipo?: string
	Ativo: boolean
}
