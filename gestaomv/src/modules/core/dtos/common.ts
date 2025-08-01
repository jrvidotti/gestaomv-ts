// ============ MENSAGENS DE RESPOSTA PADRÃO ============

// Interface para resposta de listagem com paginação
export interface ListagemComPaginacao<T> {
	items: T[];
	total: number;
	pagina: number;
	limite: number;
	totalPaginas: number;
}

export interface MensagemSucesso {
	message: string;
	data?: unknown;
}

export interface MensagemErro {
	error: string;
	details?: string;
	code?: string;
}
