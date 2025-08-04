export class TagoneError extends Error {
	constructor(
		message = "Erro desconhecido",
		public code = 500,
		public responseText?: string,
	) {
		super(message);
	}
}

export class LoginFailedError extends TagoneError {
	constructor(message = "Login falhou", code = 401) {
		super(message, code);
	}
}

export class UnauthorizedError extends TagoneError {
	constructor(message = "Não autorizado") {
		super(message, 403);
	}
}

export class NotFoundError extends TagoneError {
	constructor(message = "Não encontrado") {
		super(message, 404);
	}
}
