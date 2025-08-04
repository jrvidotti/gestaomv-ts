import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from '../auth/auth.router';
import { BaseRouter } from '../base/base.router';
import { TagoneRouter } from '../tagone/tagone.router';
import { AlmoxarifadoRouter } from '../almoxarifado/almoxarifado.router';
import { RhRouter } from '../rh/rh.router';

@Injectable()
export class TrpcRouter {
  public readonly appRouter: ReturnType<typeof this.criarRouter>;

  constructor(
    private readonly trpc: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly baseRouter: BaseRouter,
    private readonly tagoneRouter: TagoneRouter,
    private readonly almoxarifadoRouter: AlmoxarifadoRouter,
    private readonly rhRouter: RhRouter,
  ) {
    this.appRouter = this.criarRouter();
  }

  public criarRouter() {
    return this.trpc.router({
      auth: this.authRouter.createRouter(),
      base: this.baseRouter.createRouter(),
      tagone: this.tagoneRouter.createRouter(),
      almoxarifado: this.almoxarifadoRouter.createRouter(),
      rh: this.rhRouter.createRouter(),
    });
  }
}
