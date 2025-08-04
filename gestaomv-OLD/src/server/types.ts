// Export apenas dos tipos necessários para o frontend
import { TrpcRouter } from './trpc/trpc.router';
export type AppRouter = ReturnType<typeof TrpcRouter.prototype.criarRouter>;
