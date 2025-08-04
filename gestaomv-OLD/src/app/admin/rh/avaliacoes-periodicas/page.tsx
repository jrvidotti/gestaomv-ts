'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Calendar, Plus, Search, MoreHorizontal, Edit, Trash2, User, Star } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const ClassificacaoBadgeMap = {
  EXCELENTE: { variant: 'default' as const, label: 'Excelente' },
  BOM: { variant: 'secondary' as const, label: 'Bom' },
  REGULAR: { variant: 'outline' as const, label: 'Regular' },
  INSUFICIENTE: { variant: 'destructive' as const, label: 'Insuficiente' },
};

export default function AvaliacoesPeriodicasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: avaliacoesData, isLoading, error } = api.rh.listarAvaliacoesPeriodicas.useQuery({});

  const utils = api.useUtils();

  const header = (
    <PageHeader
      title="Avaliações Periódicas"
      subtitle="Gerencie avaliações de desempenho dos funcionários"
      actions={[
        <Button key="nova-avaliacao" onClick={() => router.push('/admin/rh/avaliacoes-periodicas/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>,
      ]}
    />
  );

  const avaliacoes = avaliacoesData?.avaliacoes || [];

  const filteredAvaliacoes = avaliacoes.filter(
    (avaliacao) =>
      (avaliacao.funcionario?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (avaliacao.avaliador?.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando avaliações...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Erro ao carregar avaliações: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Avaliações Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar avaliações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Avaliador</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Nota Final</TableHead>
                    <TableHead>Data da Avaliação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvaliacoes.map((avaliacao) => (
                    <TableRow key={avaliacao.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/rh/avaliacoes-periodicas/${avaliacao.id}/view`)}
                        >
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">
                              {avaliacao.funcionario?.nome || 'Funcionário não encontrado'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {avaliacao.periodoInicial && avaliacao.periodoFinal ? (
                            <>
                              {new Date(avaliacao.periodoInicial).toLocaleDateString('pt-BR')} -{' '}
                              {new Date(avaliacao.periodoFinal).toLocaleDateString('pt-BR')}
                            </>
                          ) : (
                            'Período não definido'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{avaliacao.avaliador?.name || 'Avaliador não encontrado'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ClassificacaoBadgeMap[avaliacao.classificacao as keyof typeof ClassificacaoBadgeMap]
                              ?.variant || 'secondary'
                          }
                        >
                          {ClassificacaoBadgeMap[avaliacao.classificacao as keyof typeof ClassificacaoBadgeMap]
                            ?.label || avaliacao.classificacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium">N/A</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {avaliacao.dataAvaliacao
                            ? new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/rh/avaliacoes-periodicas/${avaliacao.id}/view`)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/rh/avaliacoes-periodicas/${avaliacao.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
