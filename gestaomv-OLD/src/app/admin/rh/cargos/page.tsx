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
import { Briefcase, Plus, Search, MoreHorizontal, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function CargosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cargosData, isLoading, error } = api.rh.listarCargos.useQuery({});

  const utils = api.useUtils();

  const deleteCargoMutation = api.rh.deletarCargo.useMutation({
    onSuccess: () => {
      utils.rh.listarCargos.invalidate();
      toast.success('Cargo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir cargo', {
        description: error.message,
      });
    },
  });

  const cargos = cargosData?.cargos || [];

  const filteredCargos = cargos.filter(
    (cargo) =>
      cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cargo.descricao && cargo.descricao.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const header = (
    <PageHeader
      title="Gerenciamento de Cargos"
      subtitle="Gerencie cargos e funções da empresa"
      actions={[
        <Button key="novo-cargo" onClick={() => router.push('/admin/rh/cargos/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cargo
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando cargos...</div>
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
            <div className="text-red-500">Erro ao carregar cargos: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Cargos Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cargos..."
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
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Salário Base</TableHead>
                    <TableHead>Funcionários</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/rh/cargos/${cargo.id}/edit`)}
                        >
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{cargo.nome}</div>
                            {cargo.descricao && <div className="text-sm text-muted-foreground">{cargo.descricao}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cargo.departamento ? (
                          <div className="text-sm">{cargo.departamento.nome}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Não informado</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">Não informado</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Users className="h-3 w-3" />0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cargo.criadoEm ? new Date(cargo.criadoEm).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/rh/cargos/${cargo.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o cargo ${cargo.nome}?`)) {
                                  deleteCargoMutation.mutate({ id: cargo.id });
                                }
                              }}
                              disabled={deleteCargoMutation.isPending}
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
