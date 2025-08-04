'use client';

import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const header = <PageHeader title="Página não encontrada" subtitle="A página que você está procurando não existe" />;

  return (
    <AdminLayout header={header}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="relative mb-6">
              <AlertTriangle className="h-20 w-20 text-orange-500" />
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">404</h1>
            <h2 className="text-xl font-semibold text-center mb-4">Página não encontrada</h2>

            <p className="text-muted-foreground text-center text-sm mb-8 max-w-md">
              A página que você está tentando acessar não existe ou foi movida para outro local.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              <Button onClick={() => router.push('/admin')} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
