import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { TagoneService } from './tagone.service';
import { tagoneLoginSchema } from '@/shared';

@Injectable()
export class TagoneRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly tagoneService: TagoneService,
  ) {}

  createRouter() {
    return this.trpcService.router({
      login: this.trpcService.protectedProcedure.input(tagoneLoginSchema).mutation(async ({ input, ctx }) => {
        return this.tagoneService.loginAndSaveTagOne(ctx.user.id, input);
      }),

      getStatus: this.trpcService.protectedProcedure.query(async ({ ctx }) => {
        return this.tagoneService.getTagOneStatus(ctx.user.id);
      }),

      logout: this.trpcService.protectedProcedure.mutation(async ({ ctx }) => {
        return this.tagoneService.logoutTagOne(ctx.user.id);
      }),

      getUserTagOne: this.trpcService.protectedProcedure.query(async ({ ctx }) => {
        return this.tagoneService.getUserTagOne(ctx.user.id);
      }),
    });
  }
}

// Export para compatibilidade com código existente
export const tagoneRouter = {
  login: {},
  getStatus: {},
  logout: {},
  getUserTagOne: {},
};
