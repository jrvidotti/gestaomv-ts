/**
 * Classe base para erros customizados do módulo factoring
 */
export abstract class FactoringError extends Error {
	abstract readonly code: string;

	constructor(
		message: string,
		public cause?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Erro para quando um recurso não é encontrado
 */
export class NotFoundError extends FactoringError {
	readonly code = "NOT_FOUND";
}

/**
 * Erro para conflitos de dados (ex: documento duplicado)
 */
export class ConflictError extends FactoringError {
	readonly code = "CONFLICT";
}

/**
 * Erro para validações de negócio
 */
export class ValidationError extends FactoringError {
	readonly code = "VALIDATION_ERROR";

	constructor(
		message: string,
		public field?: string,
		cause?: unknown,
	) {
		super(message, cause);
	}
}

/**
 * Erro para pré-condições não atendidas (ex: tentativa de deletar com vínculos)
 */
export class PreconditionFailedError extends FactoringError {
	readonly code = "PRECONDITION_FAILED";
}

/**
 * Erro para problemas de autorização/permissão
 */
export class UnauthorizedError extends FactoringError {
	readonly code = "UNAUTHORIZED";
}

/**
 * Erro para falhas na integração com APIs externas
 */
export class ExternalApiError extends FactoringError {
	readonly code = "EXTERNAL_API_ERROR";

	constructor(
		message: string,
		public apiName: string,
		cause?: unknown,
	) {
		super(message, cause);
	}
}
