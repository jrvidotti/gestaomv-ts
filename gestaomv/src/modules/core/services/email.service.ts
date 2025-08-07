import { env } from "@/env";
import type {
	TemplateService,
	WelcomeEmailData,
} from "@/modules/core/services/template.service";
import { Resend } from "resend";

export class EmailService {
	private readonly resend: Resend | null;

	constructor(private readonly templateService: TemplateService) {
		if (env.RESEND_API_KEY) {
			this.resend = new Resend(env.RESEND_API_KEY);
		} else {
			this.resend = null;
			console.warn(
				"RESEND_API_KEY não configurada. Funcionalidade de email será desabilitada.",
			);
		}
	}

	async sendWelcomeEmail(
		email: string,
		name: string,
		options?: Partial<WelcomeEmailData>,
	): Promise<void> {
		if (!this.resend) {
			console.warn("Não é possível enviar email: Resend não configurado");
			return;
		}

		try {
			const emailData: WelcomeEmailData = {
				name,
				companyName: "Sistema de Gestão Corporativa",
				systemUrl: env.SERVER_URL || "#",
				supportEmail: env.RESEND_EMAIL_FROM || "#",
				...options,
			};

			const htmlContent = this.templateService.renderWelcomeEmail(emailData);
			const subject = this.templateService.renderWelcomeSubject({
				name,
				companyName: emailData.companyName,
			});

			const response = await this.resend.emails.send({
				from: env.RESEND_EMAIL_FROM || "",
				to: [email],
				subject,
				html: htmlContent,
			});

			// Verificar se houve erro na resposta
			if (response.error) {
				throw new Error(
					`Erro da API Resend: ${response.error.message} - ${response.error.name}`,
				);
			}

			console.log(
				`Email de boas-vindas enviado com sucesso para ${email}. ID da mensagem: ${response.data.id}`,
			);
		} catch (error) {
			console.error(
				`Falha ao enviar email de boas-vindas para ${email}:`,
				error,
			);
			// Não relançar o erro para não bloquear o registro do usuário
		}
	}

	async sendEmail(to: string, subject: string, html: string): Promise<void> {
		if (!this.resend) {
			console.warn("Não é possível enviar email: Resend não configurado");
			return;
		}

		try {
			const response = await this.resend.emails.send({
				from: env.RESEND_EMAIL_FROM || "",
				to: [to],
				subject,
				html,
			});

			// Verificar se houve erro na resposta
			if (response.error) {
				throw new Error(
					`Erro da API Resend: ${response.error.message} - ${response.error.name}`,
				);
			}

			console.log(
				`Email enviado com sucesso para ${to}. ID da mensagem: ${response.data.id}`,
			);
		} catch (error) {
			console.error(`Falha ao enviar email para ${to}:`, error);
			throw error;
		}
	}
}
