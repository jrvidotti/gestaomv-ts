import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

export interface WelcomeEmailData {
	name: string;
	systemUrl?: string;
	supportEmail?: string;
	companyName?: string;
	features?: string[];
}

export interface SolicitacaoCriadaEmailData {
	aprovadorNome: string;
	solicitacao: any;
	materiais: any[];
	valorTotal: number;
	systemUrl?: string;
}

export interface SolicitacaoAprovadaEmailData {
	gerenteNome: string;
	solicitacao: any;
	materiais: any[];
	systemUrl?: string;
}

export interface SolicitacaoRejeitadaEmailData {
	solicitacao: any;
	materiais: any[];
	motivoRejeicao?: string;
	systemUrl?: string;
}

export class TemplateService {
	private readonly templateCache = new Map<
		string,
		HandlebarsTemplateDelegate
	>();
	private readonly templatesPath: string;

	constructor() {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		this.templatesPath = path.join(__dirname, "templates");
		this.registerHelpers();
	}

	/**
	 * Registra helpers customizados do Handlebars
	 */
	private registerHelpers(): void {
		// Helper para formatação de data
		Handlebars.registerHelper("formatDate", (date: Date) => {
			return date.toLocaleDateString("pt-BR", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		});

		// Helper para capitalização
		Handlebars.registerHelper("capitalize", (str: string) => {
			return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		});

		// Helper condicional
		Handlebars.registerHelper(
			"ifEquals",
			(arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) => {
				return arg1 === arg2 ? options.fn(options) : options.inverse(options);
			},
		);

		// Helper para formatação de moeda
		Handlebars.registerHelper("formatCurrency", (value: number) => {
			return new Intl.NumberFormat("pt-BR", {
				style: "currency",
				currency: "BRL",
			}).format(value || 0);
		});

		// Helper para formatação de números com padding
		Handlebars.registerHelper("formatNumber", (value: number, padding = 6) => {
			return value.toString().padStart(padding, "0");
		});

		// Helper de comparação not equals
		Handlebars.registerHelper("ne", (arg1: unknown, arg2: unknown) => {
			return arg1 !== arg2;
		});
	}

	/**
	 * Carrega e compila um template
	 */
	private loadTemplate(templateName: string): HandlebarsTemplateDelegate {
		const cacheKey = templateName;

		// Verifica cache primeiro
		if (this.templateCache.has(cacheKey)) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			return this.templateCache.get(cacheKey)!;
		}

		try {
			const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);

			if (!fs.existsSync(templatePath)) {
				throw new Error(`Template file not found: ${templatePath}`);
			}

			const templateSource = fs.readFileSync(templatePath, "utf-8");
			const compiledTemplate = Handlebars.compile(templateSource);

			// Cache do template compilado
			this.templateCache.set(cacheKey, compiledTemplate);

			console.debug(`Template loaded and cached: ${templateName}`);
			return compiledTemplate;
		} catch (error) {
			console.error(`Error loading template ${templateName}:`, error);
			throw error;
		}
	}

	/**
	 * Renderiza template de e-mail de boas-vindas
	 */
	renderWelcomeEmail(data: WelcomeEmailData): string {
		const template = this.loadTemplate("welcome");

		const templateData = {
			...data,
			companyName: data.companyName || "Sistema de Gestão",
			systemUrl: data.systemUrl || "#",
			supportEmail: data.supportEmail || "suporte@empresa.com",
			features: data.features || [
				"Gerenciar usuários e permissões do sistema",
				"Controlar estoque e produtos",
				"Acompanhar fluxo financeiro",
				"Gerenciar relacionamento com clientes (CRM)",
				"Processar solicitações de RMA",
				"Personalizar configurações do sistema",
			],
		};

		return template(templateData);
	}

	/**
	 * Renderiza assunto do e-mail de boas-vindas
	 */
	renderWelcomeSubject(
		data: Pick<WelcomeEmailData, "name" | "companyName">,
	): string {
		const template = this.loadTemplate("welcome.subject");

		const templateData = {
			...data,
			companyName: data.companyName || "Sistema de Gestão",
		};

		return template(templateData);
	}

	/**
	 * Renderiza template genérico
	 */
	renderTemplate(templateName: string, data: Record<string, unknown>): string {
		const template = this.loadTemplate(templateName);
		return template(data);
	}

	/**
	 * Limpa cache de templates (útil para desenvolvimento)
	 */
	clearCache(): void {
		this.templateCache.clear();
		console.log("Template cache cleared");
	}

	/**
	 * Lista templates disponíveis
	 */
	getAvailableTemplates(): string[] {
		try {
			const files = fs.readdirSync(this.templatesPath);
			return files
				.filter((file) => file.endsWith(".hbs"))
				.map((file) => file.replace(".hbs", ""));
		} catch (error) {
			console.error("Error listing templates:", error);
			return [];
		}
	}

	// ============ MÉTODOS DO ALMOXARIFADO ============

	/**
	 * Renderiza template de solicitação criada
	 */
	renderSolicitacaoCriadaEmail(data: SolicitacaoCriadaEmailData): string {
		const template = this.loadTemplate("almoxarifado/solicitacao-criada");

		const templateData = {
			...data,
			systemUrl: data.systemUrl || "#",
		};

		return template(templateData);
	}

	/**
	 * Renderiza assunto de solicitação criada
	 */
	renderSolicitacaoCriadaSubject(
		data: Pick<SolicitacaoCriadaEmailData, "solicitacao">,
	): string {
		const template = this.loadTemplate(
			"almoxarifado/solicitacao-criada.subject",
		);
		return template(data);
	}

	/**
	 * Renderiza template de solicitação aprovada
	 */
	renderSolicitacaoAprovadaEmail(data: SolicitacaoAprovadaEmailData): string {
		const template = this.loadTemplate("almoxarifado/solicitacao-aprovada");

		const templateData = {
			...data,
			systemUrl: data.systemUrl || "#",
		};

		return template(templateData);
	}

	/**
	 * Renderiza assunto de solicitação aprovada
	 */
	renderSolicitacaoAprovadaSubject(
		data: Pick<SolicitacaoAprovadaEmailData, "solicitacao">,
	): string {
		const template = this.loadTemplate(
			"almoxarifado/solicitacao-aprovada.subject",
		);
		return template(data);
	}

	/**
	 * Renderiza template de solicitação rejeitada
	 */
	renderSolicitacaoRejeitadaEmail(data: SolicitacaoRejeitadaEmailData): string {
		const template = this.loadTemplate("almoxarifado/solicitacao-rejeitada");

		const templateData = {
			...data,
			systemUrl: data.systemUrl || "#",
		};

		return template(templateData);
	}

	/**
	 * Renderiza assunto de solicitação rejeitada
	 */
	renderSolicitacaoRejeitadaSubject(
		data: Pick<SolicitacaoRejeitadaEmailData, "solicitacao">,
	): string {
		const template = this.loadTemplate(
			"almoxarifado/solicitacao-rejeitada.subject",
		);
		return template(data);
	}
}
