import { env } from "@/env";
import type {
	AddUserRoleDto,
	AuthResponse,
	EmailLoginDto,
	RegisterDto,
	RemoveUserRoleDto,
	TagoneLoginDto,
} from "@/modules/core/dtos";
import { EmailService } from "@/modules/core/services/email.service";
import { NotificationsService } from "@/modules/core/services/notifications.service";
import { TagoneService } from "@/modules/core/services/tagone.service";
import { UsersService } from "@/modules/core/services/users.service";
import type { User, UserRoleType } from "@/modules/core/types";
import { TRPCError } from "@trpc/server";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export class AuthService {
	private usersService: UsersService;
	private emailService: EmailService;
	private tagoneService: TagoneService;
	private notificationsService: NotificationsService;

	constructor() {
		this.usersService = new UsersService();
		this.emailService = new EmailService();
		this.tagoneService = new TagoneService();
		this.notificationsService = new NotificationsService();
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	static generateAccessToken(user: User) {
		const payload: JwtPayload = {
			email: user.email,
			sub: user.id.toString(),
			roles: user.roles,
		};
		const access_token = jwt.sign(payload, env.JWT_SECRET, {
			expiresIn: "30d",
		});
		return access_token;
	}

	async validateUser(email: string, password: string): Promise<User | null> {
		const user = await this.usersService.findByEmail(email);
		if (
			user?.password &&
			(await this.usersService.validatePassword(password, user.password))
		) {
			return user;
		}
		return null;
	}

	private async loginSuperadmin(
		email: string,
		password: string,
	): Promise<AuthResponse> {
		// Verificar se as credenciais são do superadmin
		if (
			email !== env.SUPERADMIN_EMAIL ||
			password !== env.SUPERADMIN_PASSWORD
		) {
			throw new Error("Credenciais inválidas");
		}

		// Criar usuário virtual do superadmin
		const superadminUser = this.superuserProfile();

		const access_token = AuthService.generateAccessToken(superadminUser);

		const { password: _, ...userWithoutPassword } = superadminUser;

		return {
			access_token,
			user: userWithoutPassword,
		};
	}

	superuserProfile(): User {
		return {
			id: -1,
			email: env.SUPERADMIN_EMAIL,
			password: null,
			name: "Superadmin",
			isActive: true,
			avatar: null,
			authProvider: "email",
			roles: ["superadmin"],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	}

	async login(loginDto: EmailLoginDto): Promise<AuthResponse> {
		let user: User | null = null;
		try {
			user = await this.validateUser(loginDto.email, loginDto.password);
		} catch (error) {
			// Verificar se o erro é devido à tabela de usuários não existir
			if (
				error instanceof Error &&
				(error as any).code === "SQLITE_ERROR" &&
				(error as any).message.includes("no such table: users")
			) {
				console.log(
					"Tabela de usuários não existe, tentando login como superadmin",
				);
				return await this.loginSuperadmin(loginDto.email, loginDto.password);
			}
			throw error;
		}

		if (!user) {
			throw new Error("Credenciais inválidas");
		}

		// Verificar se o usuário possui roles atribuídas
		if (!user.roles || user.roles.length === 0) {
			throw new Error(
				"Aguardando um administrador atribuir seu perfil de acesso",
			);
		}

		const access_token = AuthService.generateAccessToken(user);

		const { password, ...userWithoutPassword } = user;

		return {
			access_token,
			user: userWithoutPassword,
		};
	}

	async register(registerDto: RegisterDto): Promise<AuthResponse> {
		const existingUser = await this.usersService.findByEmail(registerDto.email);
		if (existingUser) {
			throw new Error("Email já está em uso");
		}

		const user = await this.usersService.create(registerDto);
		const access_token = AuthService.generateAccessToken(user);

		// Enviar e-mail de boas-vindas de forma assíncrona
		// Não aguardar para não bloquear o registro em caso de erro
		this.emailService.sendWelcomeEmail(user.email, user.name).catch((error) => {
			console.error("Erro ao enviar e-mail de boas-vindas:", error);
		});

		// Enviar notificação para administradores de forma assíncrona
		const { password, ...userWithoutPassword } = user;
		this.notificationsService
			.notifyNewUserRegistration(userWithoutPassword)
			.catch((error) => {
				console.error("Erro ao enviar notificação de novo usuário:", error);
			});

		return {
			access_token,
			user: userWithoutPassword,
		};
	}

	async getProfile(
		userId: number,
	): Promise<Omit<User, "password"> | undefined> {
		const user = await this.usersService.findOne(userId);
		if (!user) {
			return undefined;
		}

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async getUserRoles(userId: number): Promise<UserRoleType[]> {
		return await this.usersService.getUserRoles(userId);
	}

	async addUserRole(addUserRoleDto: AddUserRoleDto): Promise<void> {
		return await this.usersService.addUserRole(
			addUserRoleDto.userId,
			addUserRoleDto.role,
		);
	}

	async removeUserRole(removeUserRoleDto: RemoveUserRoleDto): Promise<void> {
		return await this.usersService.removeUserRole(
			removeUserRoleDto.userId,
			removeUserRoleDto.role,
		);
	}

	async getUserWithRoles(userId: number): Promise<User | undefined> {
		return await this.usersService.findOne(userId);
	}

	async loginWithTagOne(loginDto: TagoneLoginDto): Promise<AuthResponse> {
		// Tentar fazer login no TagOne
		const tagoneResult = await this.tagoneService.loginWithTagOne(
			loginDto.usuarioTagone,
			loginDto.senha,
		);

		if (!tagoneResult) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Credenciais TagOne inválidas",
			});
		}

		// Estrutura do loggedClaims:
		// {
		//   'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '20',
		//   'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'JUNIOR.VIDOTTI',
		//   'http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider': 'ASP.NET Identity',
		//   'AspNet.Identity.SecurityStamp': 'f4167af3-6b4f-48a1-935a-dcb9ccf23d3c',
		//   FullName: 'JUNIOR CEZAR VIDOTTI',
		//   Empresas: '1,2,3,4,5,6,7,8,9,13,14,15,16,18,19,20,21,22,9997,9998,9999',
		//   EmpresaPadrao: '1',
		//   Perfil: '1',
		//   PainelPadrao: '135',
		//   Email: 'junior@modaverao.com.br',
		//   'CAIXA-ENTRADA-5': '5',
		//   FCRestoreId: '2930fa7a-53b2-4c42-9645-352bd7b4180e',
		//   GrupoFornecedor: '',
		//   'CAIXA-ENTRADA-1': '1',
		//   CodigoPessoa: '000000000000782'
		// }
		const tagoneEmail = tagoneResult.loggedClaims?.Email as string;
		const tagoneFullName = tagoneResult.loggedClaims?.FullName as string;
		const tagoneUserName = tagoneResult.loggedClaims?.[
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
		] as string;

		let emailToUse = `${loginDto.usuarioTagone}@tagone.local`; // Email padrão
		const nameToUse =
			tagoneFullName || tagoneUserName || loginDto.usuarioTagone; // Nome preferencial

		if (tagoneEmail && this.isValidEmail(tagoneEmail)) {
			// Se existe usuário com este e-mail, verificar se já tem userTagone
			const existingEmailUser =
				await this.usersService.findByEmail(tagoneEmail);
			if (existingEmailUser && existingEmailUser.authProvider !== "tagone") {
				// Verificar se este usuário já conectou ao TagOne
				const existingTagoneConnection =
					await this.usersService.findByTagOneUsername(loginDto.usuarioTagone);
				if (
					!existingTagoneConnection ||
					existingTagoneConnection.id !== existingEmailUser.id
				) {
					throw new Error(
						`Já existe um usuário cadastrado com o e-mail ${tagoneEmail}. Para conectar sua conta ao TagOne, faça login com seu e-mail e senha, depois acesse a página do Perfil para conectar ao TagOne.`,
					);
				}
			}
			emailToUse = tagoneEmail;
		}

		// Buscar usuário existente com este username TagOne
		const existingTagoneUser = await this.usersService.findByTagOneUsername(
			loginDto.usuarioTagone,
		);

		let user: User;

		if (existingTagoneUser) {
			// Usuário já existe, atualizar cookie
			user = existingTagoneUser;

			// Atualizar ou criar registro TagOne
			await this.tagoneService.loginAndSaveTagOne(user.id, {
				usuarioTagone: loginDto.usuarioTagone,
				senha: loginDto.senha,
			});
		} else {
			// Criar novo usuário
			const newUser = await this.usersService.create({
				email: emailToUse,
				name: nameToUse, // Nome preferencial do TagOne
				authProvider: "tagone",
				isActive: true,
			});

			user = newUser;

			// Criar registro TagOne
			await this.tagoneService.loginAndSaveTagOne(user.id, {
				usuarioTagone: loginDto.usuarioTagone,
				senha: loginDto.senha,
			});
		}

		// Verificar se o usuário possui roles atribuídas
		if (!user.roles || user.roles.length === 0) {
			throw new Error(
				"Aguardando um administrador atribuir seu perfil de acesso",
			);
		}

		const access_token = AuthService.generateAccessToken(user);

		const { password, ...userWithoutPassword } = user;

		return {
			access_token,
			user: userWithoutPassword,
		};
	}
}
