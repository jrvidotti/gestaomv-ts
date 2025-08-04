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
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function UnidadesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: unidades = [], isLoading, error } = api.base.unidades.findAll.useQuery();

  const utils = api.useUtils();

  const deleteUnidadeMutation = api.base.unidades.remove.useMutation({
    onSuccess: () => {
      utils.base.unidades.findAll.invalidate();
      toast.success('Unidade excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir unidade', {
        description: error.message,
      });
    },
  });

  const filteredUnidades = unidades.filter(
    (unidade) =>
      unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidade.codigo.toString().includes(searchTerm.toLowerCase()) ||
      (unidade.cidade && unidade.cidade.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const header = (
    <PageHeader
      title="Gerenciamento de Unidades"
      subtitle="Gerencie unidades, endereços e informações de contato"
      actions={[
        <Button key="nova-unidade" onClick={() => router.push('/admin/base/unidades/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando unidades...</div>
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
            <div className="text-red-500">Erro ao carregar unidades: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Unidades Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar unidades..."
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>PontoWeb ID</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnidades.map((unidade) => (
                    <TableRow key={unidade.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/base/unidades/${unidade.id}/edit`)}
                        >
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{unidade.nome}</div>
                            <div className="text-sm text-muted-foreground">{unidade.empresa?.razaoSocial}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{unidade.codigo}</Badge>
                      </TableCell>
                      <TableCell>
                        {unidade.pontowebId ? (
                          <Badge variant="secondary">#{unidade.pontowebId}</Badge>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/base/unidades/${unidade.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a unidade ${unidade.nome}?`)) {
                                  deleteUnidadeMutation.mutate({ id: unidade.id });
                                }
                              }}
                              disabled={deleteUnidadeMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
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
