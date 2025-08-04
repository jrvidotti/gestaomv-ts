import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Aplicar autenticação HTTP Basic apenas para rotas /superadmin
  if (request.nextUrl.pathname.startsWith('/superadmin')) {
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [, pwd] = atob(authValue).split(':');

      // Usar variável de ambiente diretamente no middleware edge
      const adminPassword = process.env.SUPERADMIN_PASSWORD;

      if (adminPassword && pwd === adminPassword) {
        return NextResponse.next();
      }
    }

    return new NextResponse('Acesso negado', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Superadmin"',
      },
    });
  }

  return NextResponse.next();
}

export const config_middleware = {
  matcher: ['/superadmin/:path*'],
};
