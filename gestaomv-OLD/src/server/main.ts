import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';
import { TrpcService } from './trpc/trpc.service';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: true, // Permite qualquer origem em desenvolvimento
    credentials: true,
  });

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configurar tRPC
  const trpcRouter = app.get(TrpcRouter);
  const trpcService = app.get(TrpcService);

  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: ({ req }) => trpcService.criarContexto(req),
    }),
  );

  // Prefixo global para todas as rotas da API REST
  app.setGlobalPrefix('api');

  await app.listen(config.port, '0.0.0.0');
  console.log(`Aplicação rodando na porta ${config.port}`);
  console.log(`tRPC disponível em http://localhost:${config.port}/api/trpc`);
}
bootstrap().catch(console.error);
