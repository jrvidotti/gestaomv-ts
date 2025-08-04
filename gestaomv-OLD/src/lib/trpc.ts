import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

// Tipo do AppRouter do servidor local
import type { AppRouter } from '@/server/trpc/app-router';
export type { AppRouter };

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '';
  }
  if (process.env.VERCEL_URL) {
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }
  // assume localhost - agora usa a porta padrão do Next.js
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Cliente tRPC configurado para React Query
export const api = createTRPCReact<AppRouter>();

// Cliente vanilla tRPC para uso fora de componentes React
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            return {
              authorization: `Bearer ${token}`,
            };
          }
        }
        return {};
      },
    }),
  ],
});
