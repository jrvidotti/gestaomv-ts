import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt.strategy';
import { USER_ROLES, UserRoleType } from '@/shared';

export interface Context {
  user?: {
    id: number;
    email: string;
    roles: UserRoleType[];
  };
}

@Injectable()
export class TrpcService {
  private trpc = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape }) => shape,
  });

  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  // Middleware de logging para todos os procedures
  private loggingMiddleware = this.trpc.middleware(({ next, path, type }) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    console.log(`[tRPC] ${timestamp} - ${type.toUpperCase()} ${path} - INICIADO`);

    return next().then((result) => {
      const duration = Date.now() - start;

      if (result.ok) {
        console.log(`[tRPC] ${timestamp} - ${type.toUpperCase()} ${path} - SUCESSO (${duration}ms)`);
      } else {
        console.error(
          `[tRPC] ${timestamp} - ${type.toUpperCase()} ${path} - ERRO (${duration}ms) ${result.error.code}: ${result.error.message}`,
        );
      }

      return result;
    });
  });

  // Procedimentos públicos (sem autenticação)
  publicProcedure = this.trpc.procedure.use(this.loggingMiddleware);

  // Procedimentos protegidos (com autenticação)
  protectedProcedure = this.trpc.procedure.use(this.loggingMiddleware).use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Acesso negado. Token de autenticação necessário.',
      });
    }

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });

  // Procedimentos que requerem role admin
  adminProcedure = this.trpc.procedure.use(this.loggingMiddleware).use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Acesso negado. Token de autenticação necessário.',
      });
    }

    // Verifica se o usuário tem role admin (principal ou adicional)
    const hasAdminRole = ctx.user.roles.includes(USER_ROLES.ADMIN);

    if (!hasAdminRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Acesso negado. Permissão de administrador necessária.',
      });
    }

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });

  // Procedimento que verifica se o usuário tem pelo menos uma das roles especificadas
  createRoleProcedure = (allowedRoles: string[]) => {
    return this.trpc.procedure.use(this.loggingMiddleware).use(({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Acesso negado. Token de autenticação necessário.',
        });
      }

      const hasRole = ctx.user.roles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Acesso negado. Permissões necessárias: ${allowedRoles.join(', ')}.`,
        });
      }

      return next({
        ctx: {
          user: ctx.user,
        },
      });
    });
  };

  // Método para criar contexto
  async criarContexto(req: Request): Promise<Context> {
    const context: Context = {};

    try {
      const authHeader = req.headers.authorization as string;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = this.jwtService.verify<JwtPayload>(token);

        if (payload && payload.sub) {
          const user = await this.authService.getUserWithRoles(payload.sub);
          if (user) {
            context.user = {
              id: user.id,
              email: user.email,
              roles: user.roles,
            };
          }
        }
      }
    } catch {
      // Token inválido - continua com context vazio
    }

    return context;
  }

  router = this.trpc.router;
  mergeRouters = this.trpc.mergeRouters;
}
