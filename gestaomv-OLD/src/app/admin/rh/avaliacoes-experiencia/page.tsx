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
import { Star, Plus, Search, MoreHorizontal, Edit, Trash2, User, Calendar } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const RecomendacaoBadgeMap = {
  APROVADO: { variant: 'default' as const, label: 'Aprovado' },
  REPROVADO: { variant: 'destructive' as const, label: 'Reprovado' },
  PRORROGAR: { variant: 'secondary' as const, label: 'Prorrogar' },
};

export default function AvaliacoesExperienciaPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: avaliacoesData, isLoading, error } = api.rh.listarAvaliacoesExperiencia.useQuery({});

  const utils = api.useUtils();

  const header = (
    <PageHeader
      title="Avaliações de Experiência"
      subtitle="Gerencie avaliações do período de experiência"
      actions={[
        <Button key="nova-avaliacao" onClick={() => router.push('/admin/rh/avaliacoes-experiencia/nova')}>
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Avaliador</TableHead>
                    <TableHead>Recomendação</TableHead>
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
                          onClick={() => router.push(`/admin/rh/avaliacoes-experiencia/${avaliacao.id}/view`)}
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
                        <Badge variant="outline">{avaliacao.tipo?.replace('_', ' ') || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{avaliacao.avaliador?.name || 'Avaliador não encontrado'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            RecomendacaoBadgeMap[avaliacao.recomendacao as keyof typeof RecomendacaoBadgeMap]
                              ?.variant || 'secondary'
                          }
                        >
                          {RecomendacaoBadgeMap[avaliacao.recomendacao as keyof typeof RecomendacaoBadgeMap]?.label ||
                            avaliacao.recomendacao}
                        </Badge>
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
                              onClick={() => router.push(`/admin/rh/avaliacoes-experiencia/${avaliacao.id}/view`)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/rh/avaliacoes-experiencia/${avaliacao.id}/edit`)}
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
