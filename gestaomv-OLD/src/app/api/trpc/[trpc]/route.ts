import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { getAppRouter } from '@/server/trpc/app-router';
import { createTRPCContext } from '@/server/trpc/context-temp';

const handler = async (req: Request) => {
  try {
    // Obter o router inicializado do NestJS
    const router = await getAppRouter();

    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router,
      createContext: ({ req }) => createTRPCContext(req),
      onError: ({ error, path, type }) => {
        console.error(`[tRPC Route] Erro em ${type} ${path}: ${error.code} - ${error.message}`);
      },
    });
  } catch (error) {
    console.error('[tRPC Route] Erro ao processar request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export { handler as GET, handler as POST };
