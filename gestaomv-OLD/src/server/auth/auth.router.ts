import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { AuthService } from './auth.service';
import { UsersService } from '../base/users.service';
import {
  loginSchema,
  registerSchema,
  addUserRoleSchema,
  removeUserRoleSchema,
  getUserRolesSchema,
  changePasswordSchema,
  tagoneAuthLoginSchema,
} from '@/shared';

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  createRouter() {
    return this.trpcService.router({
      login: this.trpcService.publicProcedure.input(loginSchema).mutation(async ({ input }) => {
        return this.authService.login(input);
      }),

      loginWithTagOne: this.trpcService.publicProcedure.input(tagoneAuthLoginSchema).mutation(async ({ input }) => {
        return this.authService.loginWithTagOne(input);
      }),

      register: this.trpcService.publicProcedure.input(registerSchema).mutation(async ({ input }) => {
        return this.authService.register(input);
      }),

      profile: this.trpcService.protectedProcedure.query(async ({ ctx }) => {
        return this.authService.getUserWithRoles(ctx.user.id);
      }),

      getUserRoles: this.trpcService.protectedProcedure.input(getUserRolesSchema).query(async ({ input }) => {
        return this.authService.getUserRoles(input.userId);
      }),

      addUserRole: this.trpcService.adminProcedure.input(addUserRoleSchema).mutation(async ({ input }) => {
        await this.authService.addUserRole(input);
        return { message: 'Role adicionada com sucesso' };
      }),

      removeUserRole: this.trpcService.adminProcedure.input(removeUserRoleSchema).mutation(async ({ input }) => {
        await this.authService.removeUserRole(input);
        return { message: 'Role removida com sucesso' };
      }),

      logout: this.trpcService.protectedProcedure.mutation(async () => {
        // Em uma implementação real, você poderia invalidar o token
        // Por enquanto, apenas retornamos uma mensagem de sucesso
        return { message: 'Logout realizado com sucesso' };
      }),

      changePassword: this.trpcService.protectedProcedure
        .input(changePasswordSchema)
        .mutation(async ({ input, ctx }) => {
          await this.usersService.changePassword(ctx.user.id, {
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
          });
          return { message: 'Senha alterada com sucesso' };
        }),
    });
  }
}
