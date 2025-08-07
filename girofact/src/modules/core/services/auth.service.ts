import { env } from "@/env";
import type {
  AddUserRoleDto,
  AuthResponse,
  EmailLoginDto,
  RegisterDto,
  RemoveUserRoleDto,
} from "@/modules/core/dtos";
import type { EmailService } from "@/modules/core/services/email.service";
import type { NotificationsService } from "@/modules/core/services/notifications.service";
import type { UsersService } from "@/modules/core/services/users.service";
import type { User, UserRoleType } from "@/modules/core/types";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}

  async loginSuperadmin(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    // Verificar se as credenciais são do superadmin
    if (
      email !== env.SUPERADMIN_EMAIL ||
      password !== env.SUPERADMIN_PASSWORD
    ) {
      throw new Error("Credenciais inválidas");
    }

    // Criar usuário virtual do superadmin
    const superadminUser = this.perfilSuperadmin();

    const access_token = this.generateAccessToken(superadminUser);

    const { password: _, ...userWithoutPassword } = superadminUser;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  perfilSuperadmin(): User {
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
          "Tabela de usuários não existe, tentando login como superadmin"
        );
        return await this.loginSuperadmin(loginDto.email, loginDto.password);
      }
      throw error;
    }

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar se o usuário possui roles atribuídas
    this.checkUserHasRoles(user);

    const access_token = this.generateAccessToken(user);

    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async registrar(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    const user = await this.usersService.criar(registerDto);
    const access_token = this.generateAccessToken(user);

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
    userId: number
  ): Promise<Omit<User, "password"> | undefined> {
    const user = await this.usersService.buscar(userId);
    if (!user) {
      return undefined;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async buscarUserRoles(userId: number): Promise<UserRoleType[]> {
    return await this.usersService.getUserRoles(userId);
  }

  async adicionarUserRole(addUserRoleDto: AddUserRoleDto): Promise<void> {
    return await this.usersService.addUserRole(
      addUserRoleDto.userId,
      addUserRoleDto.role
    );
  }

  async removerUserRole(removeUserRoleDto: RemoveUserRoleDto): Promise<void> {
    return await this.usersService.removeUserRole(
      removeUserRoleDto.userId,
      removeUserRoleDto.role
    );
  }

  async buscarPerfil(userId: number): Promise<User | undefined> {
    return await this.usersService.buscar(userId);
  }

  private generateAccessToken(user: User) {
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

  private async validateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user?.password &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      return user;
    }
    return null;
  }

  private checkUserHasRoles(user: User) {
    if (!user.roles || user.roles.length === 0) {
      throw new Error(
        "Aguardando um administrador atribuir seu perfil de acesso"
      );
    }
  }
}
