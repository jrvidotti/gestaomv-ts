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
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const StatusBadgeMap = {
  ATIVO: { variant: 'default' as const, label: 'Ativo' },
  INATIVO: { variant: 'secondary' as const, label: 'Inativo' },
  DEMITIDO: { variant: 'destructive' as const, label: 'Demitido' },
  EXPERIENCIA: { variant: 'outline' as const, label: 'Experiência' },
  AFASTADO: { variant: 'secondary' as const, label: 'Afastado' },
};

export default function FuncionariosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: funcionariosData, isLoading, error } = api.rh.listarFuncionarios.useQuery({});

  const utils = api.useUtils();

  const deleteFuncionarioMutation = api.rh.deletarFuncionario.useMutation({
    onSuccess: () => {
      utils.rh.listarFuncionarios.invalidate();
      toast.success('Funcionário excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir funcionário', {
        description: error.message,
      });
    },
  });

  const funcionarios = funcionariosData?.funcionarios || [];

  const filteredFuncionarios = funcionarios.filter(
    (funcionario) =>
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cpf.includes(searchTerm.replace(/\D/g, '')) ||
      (funcionario.email && funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Função para formatar CPF
  const formatCpf = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const header = (
    <PageHeader
      title="Gerenciamento de Funcionários"
      subtitle="Gerencie funcionários e informações pessoais"
      actions={[
        <Button key="novo-funcionario" onClick={() => router.push('/admin/rh/funcionarios/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando funcionários...</div>
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
            <div className="text-red-500">Erro ao carregar funcionários: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Funcionários Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar funcionários..."
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
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Admissão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFuncionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/rh/funcionarios/${funcionario.id}/edit`)}
                        >
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{funcionario.nome}</div>
                            {funcionario.email && (
                              <div className="text-sm text-muted-foreground">{funcionario.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {formatCpf(funcionario.cpf)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {funcionario.cargo ? (
                          <div className="text-sm">{funcionario.cargo.nome}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Não informado</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {funcionario.departamento ? (
                          <div className="text-sm">{funcionario.departamento.nome}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Não informado</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            StatusBadgeMap[funcionario.status as keyof typeof StatusBadgeMap]?.variant || 'secondary'
                          }
                        >
                          {StatusBadgeMap[funcionario.status as keyof typeof StatusBadgeMap]?.label ||
                            funcionario.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {funcionario.dataAdmissao
                          ? new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')
                          : '-'}
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
                              onClick={() => router.push(`/admin/rh/funcionarios/${funcionario.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir o funcionário ${funcionario.nome}?`)) {
                                  deleteFuncionarioMutation.mutate({ id: funcionario.id });
                                }
                              }}
                              disabled={deleteFuncionarioMutation.isPending}
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
