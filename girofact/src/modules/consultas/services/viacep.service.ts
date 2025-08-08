import { ValidationError } from "@/modules/factoring/errors";

export interface ViaCepResponse {
	cep: string;
	logradouro: string;
	complemento: string;
	bairro: string;
	localidade: string;
	uf: string;
	ibge: string;
	gia: string;
	ddd: string;
	siafi: string;
	erro?: boolean;
}

export class ViaCepService {
	private readonly baseUrl = "https://viacep.com.br/ws";

	async consultarCep(cep: string) {
		// Validar formato do CEP
		if (!cep.match(/^\d{5}-?\d{3}$/)) {
			throw new ValidationError(
				"CEP deve ter formato válido (00000-000)",
				"cep",
			);
		}

		const cepLimpo = cep.replace(/\D/g, "");

		try {
			const response = await fetch(`${this.baseUrl}/${cepLimpo}/json/`);

			if (!response.ok) {
				return {
					fonte: "erro" as const,
					dados: null,
					erro: `Erro HTTP: ${response.status}`,
					mensagem: "Erro ao consultar CEP na API ViaCEP",
				};
			}

			const data: ViaCepResponse = await response.json();

			// ViaCEP retorna { erro: true } quando CEP não é encontrado
			if (data.erro) {
				return {
					fonte: "nao_encontrado" as const,
					dados: null,
					mensagem: "CEP não encontrado",
				};
			}

			// Mapear para estrutura padronizada
			const dadosMapeados = {
				cep: data.cep.replace(/(\d{5})(\d{3})/, "$1-$2"),
				logradouro: data.logradouro,
				complemento: data.complemento,
				bairro: data.bairro,
				cidade: data.localidade,
				estado: data.uf,
				ibge: data.ibge,
				ddd: data.ddd,
			};

			return {
				fonte: "viacep" as const,
				dados: dadosMapeados,
			};
		} catch (error) {
			return {
				fonte: "erro" as const,
				dados: null,
				erro: error instanceof Error ? error.message : "Erro desconhecido",
				mensagem:
					"Erro ao consultar CEP. Verifique sua conexão e tente novamente.",
			};
		}
	}
}
