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
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2, Users, Briefcase } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function DepartamentosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: departamentosData, isLoading, error } = api.rh.listarDepartamentos.useQuery({});

  const utils = api.useUtils();

  const deleteDepartamentoMutation = api.rh.deletarDepartamento.useMutation({
    onSuccess: () => {
      utils.rh.listarDepartamentos.invalidate();
      toast.success('Departamento excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir departamento', {
        description: error.message,
      });
    },
  });

  const departamentos = departamentosData?.departamentos || [];

  const filteredDepartamentos = departamentos.filter(
    (departamento) =>
      departamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (departamento.descricao && departamento.descricao.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const header = (
    <PageHeader
      title="Gerenciamento de Departamentos"
      subtitle="Gerencie departamentos e estrutura organizacional"
      actions={[
        <Button key="novo-departamento" onClick={() => router.push('/admin/rh/departamentos/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Departamento
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando departamentos...</div>
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
            <div className="text-red-500">Erro ao carregar departamentos: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Departamentos Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar departamentos..."
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
                    <TableHead>Departamento</TableHead>
                    <TableHead>Funcionários</TableHead>
                    <TableHead>Cargos</TableHead>
                    <TableHead>Equipes</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartamentos.map((departamento) => (
                    <TableRow key={departamento.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/rh/departamentos/${departamento.id}/edit`)}
                        >
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{departamento.nome}</div>
                            {departamento.descricao && (
                              <div className="text-sm text-muted-foreground">{departamento.descricao}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Users className="h-3 w-3" />0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Briefcase className="h-3 w-3" />0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Building2 className="h-3 w-3" />0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {departamento.criadoEm ? new Date(departamento.criadoEm).toLocaleDateString('pt-BR') : '-'}
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
                              onClick={() => router.push(`/admin/rh/departamentos/${departamento.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o departamento ${departamento.nome}?`)) {
                                  deleteDepartamentoMutation.mutate({ id: departamento.id });
                                }
                              }}
                              disabled={deleteDepartamentoMutation.isPending}
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
