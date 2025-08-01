import { USER_ROLES_DATA } from "@/constants";
import { env } from "@/env";
import { USER_ROLES } from "@/modules/core/enums";
import { ConfiguracoesService } from "@/modules/core/services/configuracoes.service";
import { EmailService } from "@/modules/core/services/email.service";
import { TemplateService } from "@/modules/core/services/template.service";
import { UsersService } from "@/modules/core/services/users.service";
import type { User, UserRoleType } from "@/modules/core/types";

export class NotificationsService {
	private emailService: EmailService;
	private templateService: TemplateService;
	private configuracoesService: ConfiguracoesService;
	private usersService: UsersService;

	constructor() {
		this.emailService = new EmailService();
		this.templateService = new TemplateService();
		this.configuracoesService = new ConfiguracoesService();
		this.usersService = new UsersService();
	}

	async notifyNewUserRegistration(
		newUser: Omit<User, "password">,
	): Promise<void> {
		try {
			// Verificar se notificações estão habilitadas
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();

			if (!configuracoes.notifyNewUsers || !configuracoes.emailNotifications) {
				console.log("Notificações de novos usuários desabilitadas");
				return;
			}

			// Obter lista de administradores para notificar
			if (!configuracoes.newUserNotificationAdmins) {
				console.log(
					"Nenhum administrador configurado para receber notificações",
				);
				return;
			}

			const adminIds = configuracoes.newUserNotificationAdmins
				.split(",")
				.map((id) => Number.parseInt(id.trim()))
				.filter((id) => !Number.isNaN(id));

			if (adminIds.length === 0) {
				console.log("Lista de administradores inválida");
				return;
			}

			// Buscar dados dos administradores usando import dinâmico
			const usersService = new UsersService();
			const admins = await Promise.all(
				adminIds.map((id) => usersService.findOne(id)),
			);

			const validAdmins = admins.filter((admin) => admin?.email);

			if (validAdmins.length === 0) {
				console.log("Nenhum administrador válido encontrado");
				return;
			}

			// Preparar dados do email
			const emailSubject = "🔔 Novo usuário registrado no sistema";
			const emailContent = this.generateNewUserEmailContent(newUser);

			// Enviar notificação para cada administrador
			const emailPromises = validAdmins
				.filter((admin) => !!admin?.email)
				.map((admin) =>
					this.emailService
						.sendEmail(admin?.email || "", emailSubject, emailContent)
						.catch((error) => {
							console.error(
								`Erro ao enviar email para ${admin?.email}:`,
								error,
							);
							return null;
						}),
				);

			await Promise.allSettled(emailPromises);
			console.log(
				`Notificações enviadas para ${validAdmins.length} administradores`,
			);
		} catch (error) {
			console.error("Erro ao enviar notificações de novo usuário:", error);
		}
	}

	private getUserManagementUrl(userId: number): string {
		return `${env.SERVER_URL}/admin/base/users/${userId}/edit`;
	}

	private generateNewUserEmailContent(user: Omit<User, "password">): string {
		const formatDate = (dateString: string | null) => {
			if (!dateString) return "N/A";
			return new Date(dateString).toLocaleString("pt-BR", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		};

		return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Novo Usuário Registrado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .user-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
        .badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 Novo Usuário Registrado</h2>
            <p>Um novo usuário se registrou no sistema e precisa de aprovação.</p>
        </div>
        
        <div class="content">
            <h3>Informações do Usuário</h3>
            
            <div class="user-info">
                <p><strong>Nome:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Status:</strong> <span class="badge">${user.isActive ? "Ativo" : "Inativo"}</span></p>
                <p><strong>Provedor de Autenticação:</strong> ${user.authProvider || "Padrão"}</p>
                <p><strong>Data de Registro:</strong> ${formatDate(user.createdAt)}</p>
                ${user.roles && user.roles.length > 0 ? `<p><strong>Roles:</strong> ${user.roles.join(", ")}</p>` : ""}
            </div>
            
            <h4>Próximos Passos</h4>
            <ul>
                <li>Revisar as informações do usuário</li>
                <li>Definir permissões apropriadas se necessário</li>
                <li>Entrar em contato com o usuário se necessário</li>
            </ul>
            
            <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 6px; text-align: center;">
                <p style="margin-bottom: 10px;"><strong>Gerenciar este usuário:</strong></p>
                <a href="${this.getUserManagementUrl(user.id)}" 
                   style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Ver Usuário no Painel Admin
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Esta é uma notificação automática do sistema de gestão.</p>
            <p>Para desabilitar estas notificações, acesse as Configurações do Sistema.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
	}

	async notifyUserApproved(
		user: Omit<User, "password">,
		assignedRoles: UserRoleType[],
	): Promise<void> {
		try {
			// Verificar se notificações estão habilitadas
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();

			if (
				!configuracoes.notifyUserApproval ||
				!configuracoes.emailNotifications
			) {
				console.log("Notificações de aprovação de usuários desabilitadas");
				return;
			}

			if (!user.email) {
				console.log("Usuário não possui email válido");
				return;
			}

			// Preparar dados do email
			const emailSubject = "🎉 Bem-vindo! Seu cadastro foi aprovado";
			const emailContent = this.generateUserApprovalEmailContent(
				user,
				assignedRoles,
			);

			// Enviar email para o usuário aprovado
			await this.emailService.sendEmail(user.email, emailSubject, emailContent);
			console.log(`Email de aprovação enviado para ${user.email}`);
		} catch (error) {
			console.error(
				"Erro ao enviar notificação de aprovação de usuário:",
				error,
			);
		}
	}

	private generateUserApprovalEmailContent(
		user: Omit<User, "password">,
		assignedRoles: UserRoleType[],
	): string {
		const formatDate = (dateString: string | null) => {
			if (!dateString) return "N/A";
			return new Date(dateString).toLocaleString("pt-BR", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		};

		// Converter roles para labels amigáveis
		const roleLabels = assignedRoles
			.map((role) => USER_ROLES_DATA[role]?.label || role)
			.join(", ");

		return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cadastro Aprovado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center; color: white; }
        .content { background: white; padding: 30px; border: 1px solid #dee2e6; border-radius: 8px; }
        .welcome-info { background: #f8f9ff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #007bff; }
        .permissions { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; text-align: center; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .btn:hover { background: #0056b3; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Parabéns!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Seu cadastro foi aprovado</p>
        </div>
        
        <div class="content">
            <h2>Olá, ${user.name}!</h2>
            
            <p>Temos o prazer de informar que seu cadastro no sistema foi <strong>aprovado com sucesso</strong>! 
            Você já pode acessar todas as funcionalidades disponíveis para seu perfil.</p>
            
            <div class="welcome-info">
                <h3 style="margin-top: 0; color: #007bff;">📋 Informações da sua conta</h3>
                <p><strong>Nome:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Data de aprovação:</strong> ${formatDate(new Date().toISOString())}</p>
            </div>
            
            <div class="permissions">
                <h3 style="margin-top: 0; color: #28a745;">🔑 Suas permissões</h3>
                <p>Você foi aprovado com as seguintes permissões:</p>
                <p style="font-size: 16px; font-weight: bold; color: #495057;">${roleLabels}</p>
            </div>
            
            <h3>🚀 Próximos passos</h3>
            <ul>
                <li>Acesse o sistema usando seu email e senha</li>
                <li>Explore as funcionalidades disponíveis para seu perfil</li>
                <li>Entre em contato conosco caso tenha alguma dúvida</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${env.SERVER_URL}/login" class="btn">
                    🔐 Acessar o Sistema
                </a>
            </div>
            
            <p style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; text-align: center;">
                <strong>💡 Dica:</strong> Marque este email como importante para futuras consultas sobre sua conta.
            </p>
        </div>
        
        <div class="footer">
            <p>Seja bem-vindo(a) ao nosso sistema! Estamos aqui para ajudá-lo(a).</p>
            <p>Esta é uma notificação automática. Por favor, não responda a este email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
	}

	async notifySystemMaintenance(
		isMaintenanceMode: boolean,
		adminIds?: number[],
	): Promise<void> {
		try {
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();

			if (!configuracoes.emailNotifications) {
				return;
			}

			// Se não especificado, usar todos os admins configurados
			const targetAdminIds =
				adminIds ||
				(configuracoes.newUserNotificationAdmins
					? configuracoes.newUserNotificationAdmins
							.split(",")
							.map((id) => Number.parseInt(id.trim()))
							.filter((id) => !Number.isNaN(id))
					: []);

			if (targetAdminIds.length === 0) {
				return;
			}

			const usersService = new UsersService();
			const admins = await Promise.all(
				targetAdminIds.map((id) => usersService.findOne(id)),
			);

			const validAdmins = admins.filter((admin) => !!admin?.email);

			const subject = isMaintenanceMode
				? "🔧 Sistema em Modo de Manutenção"
				: "✅ Sistema Retornou ao Normal";

			const content = isMaintenanceMode
				? "O sistema foi colocado em modo de manutenção. Os usuários não conseguirão acessar o sistema temporariamente."
				: "O modo de manutenção foi desativado e o sistema voltou ao funcionamento normal.";

			const emailPromises = validAdmins
				.filter((admin) => admin?.email)
				.map((admin) =>
					this.emailService
						.sendEmail(admin?.email || "", subject, content)
						.catch((error) =>
							console.error(
								`Erro ao enviar email para ${admin?.email}:`,
								error,
							),
						),
				);

			await Promise.allSettled(emailPromises);
		} catch (error) {
			console.error("Erro ao enviar notificações de manutenção:", error);
		}
	}

	// ============ MÉTODOS DO ALMOXARIFADO ============

	async notificarSolicitacaoCriada(
		solicitacao: any,
		materiais: any[],
	): Promise<void> {
		try {
			console.log(
				`📧 [Almoxarifado] Enviando notificações de solicitação criada #${solicitacao.id}`,
			);

			// Verificar se notificações estão habilitadas
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();
			if (!configuracoes.emailNotifications) {
				console.log("Notificações por email desabilitadas");
				return;
			}

			// Buscar todos os aprovadores de almoxarifado
			const aprovadores = await this.usersService.findUsersByRoles([
				USER_ROLES.ADMIN,
				USER_ROLES.APROVADOR_ALMOXARIFADO,
			]);

			if (aprovadores.length === 0) {
				console.log("Nenhum aprovador de almoxarifado encontrado");
				return;
			}

			console.log(
				`📧 [Almoxarifado] Enviando para ${aprovadores.length} aprovadores`,
			);

			// Calcular valor total
			const valorTotal = materiais.reduce((total, item) => {
				return total + item.material.valorUnitario * item.qtdSolicitada;
			}, 0);

			// Enviar email para cada aprovador
			const emailPromises = aprovadores.map(async (aprovador) => {
				try {
					const emailContent =
						this.templateService.renderSolicitacaoCriadaEmail({
							aprovadorNome: aprovador.name,
							solicitacao,
							materiais,
							valorTotal,
							systemUrl: env.SERVER_URL,
						});

					const emailSubject =
						this.templateService.renderSolicitacaoCriadaSubject({
							solicitacao,
						});

					await this.emailService.sendEmail(
						aprovador.email,
						emailSubject,
						emailContent,
					);
					console.log(
						`✅ [Almoxarifado] Email enviado para ${aprovador.email}`,
					);
				} catch (error) {
					console.error(
						`❌ [Almoxarifado] Erro ao enviar email para ${aprovador.email}:`,
						error,
					);
				}
			});

			await Promise.allSettled(emailPromises);
		} catch (error) {
			console.error(
				"❌ [Almoxarifado] Erro ao enviar notificações de solicitação criada:",
				error,
			);
		}
	}

	async notificarSolicitacaoAprovada(
		solicitacao: any,
		materiais: any[],
	): Promise<void> {
		try {
			console.log(
				`📧 [Almoxarifado] Enviando notificações de solicitação aprovada #${solicitacao.id}`,
			);

			// Verificar se notificações estão habilitadas
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();
			if (!configuracoes.emailNotifications) {
				console.log("Notificações por email desabilitadas");
				return;
			}

			// Buscar todos os gerentes de almoxarifado
			const gerentes = await this.usersService.findUsersByRoles([
				USER_ROLES.ADMIN,
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.APROVADOR_ALMOXARIFADO,
			]);

			if (gerentes.length === 0) {
				console.log("Nenhum gerente de almoxarifado encontrado");
				return;
			}

			console.log(
				`📧 [Almoxarifado] Enviando para ${gerentes.length} gerentes`,
			);

			// Enviar email para cada gerente
			const emailPromises = gerentes.map(async (gerente) => {
				try {
					const emailContent =
						this.templateService.renderSolicitacaoAprovadaEmail({
							gerenteNome: gerente.name,
							solicitacao,
							materiais,
							systemUrl: env.SERVER_URL,
						});

					const emailSubject =
						this.templateService.renderSolicitacaoAprovadaSubject({
							solicitacao,
						});

					await this.emailService.sendEmail(
						gerente.email,
						emailSubject,
						emailContent,
					);
					console.log(`✅ [Almoxarifado] Email enviado para ${gerente.email}`);
				} catch (error) {
					console.error(
						`❌ [Almoxarifado] Erro ao enviar email para ${gerente.email}:`,
						error,
					);
				}
			});

			await Promise.allSettled(emailPromises);
		} catch (error) {
			console.error(
				"❌ [Almoxarifado] Erro ao enviar notificações de solicitação aprovada:",
				error,
			);
		}
	}

	async notificarSolicitacaoRejeitada(
		solicitacao: any,
		materiais: any[],
		motivoRejeicao?: string,
	): Promise<void> {
		try {
			console.log(
				`📧 [Almoxarifado] Enviando notificação de solicitação rejeitada #${solicitacao.id}`,
			);

			// Verificar se notificações estão habilitadas
			const configuracoes =
				await this.configuracoesService.getConfiguracoesSistema();
			if (!configuracoes.emailNotifications) {
				console.log("Notificações por email desabilitadas");
				return;
			}

			// Verificar se o solicitante tem email
			if (!solicitacao.solicitante?.email) {
				console.log("Solicitante não possui email válido");
				return;
			}

			console.log(
				`📧 [Almoxarifado] Enviando para solicitante: ${solicitacao.solicitante.email}`,
			);

			try {
				const emailContent =
					this.templateService.renderSolicitacaoRejeitadaEmail({
						solicitacao,
						materiais,
						motivoRejeicao,
						systemUrl: env.SERVER_URL,
					});

				const emailSubject =
					this.templateService.renderSolicitacaoRejeitadaSubject({
						solicitacao,
					});

				await this.emailService.sendEmail(
					solicitacao.solicitante.email,
					emailSubject,
					emailContent,
				);
				console.log(
					"✅ [Almoxarifado] Email de rejeição enviado para solicitante",
				);
			} catch (error) {
				console.error(
					"❌ [Almoxarifado] Erro ao enviar email para solicitante:",
					error,
				);
			}
		} catch (error) {
			console.error(
				"❌ [Almoxarifado] Erro ao enviar notificações de solicitação rejeitada:",
				error,
			);
		}
	}
}
