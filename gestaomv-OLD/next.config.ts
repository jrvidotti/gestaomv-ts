import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuração para Docker - output standalone
  output: 'standalone',

  // Configuração para bibliotecas do servidor
  serverExternalPackages: ['handlebars'],

  // Configuração para desenvolvimento - permitir todas as origens
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['*'],
  }),

  devIndicators: {
    position: 'bottom-right',
  },

  // Configuração de imagens para Next.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.modaverao.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fly.storage.tigris.dev',
        port: '',
        pathname: '/**',
      },
      // Permitir qualquer hostname em desenvolvimento
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'https' as const,
              hostname: '**',
            },
          ]
        : []),
    ],
    // Permitir URLs do próprio site (endpoint proxy)
    domains: ['localhost'],
    // Desabilitar otimização para endpoints locais
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Suprimir warnings específicos do webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suprimir warning crítico do load-esm (usado pelo NestJS)
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /load-esm/,
          message: /Critical dependency: the request of a dependency is an expression/,
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
