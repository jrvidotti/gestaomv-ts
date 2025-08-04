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
import { Building, Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function EmpresasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: empresas = [], isLoading, error } = api.base.empresas.findAll.useQuery();

  const utils = api.useUtils();

  const deleteEmpresaMutation = api.base.empresas.remove.useMutation({
    onSuccess: () => {
      utils.base.empresas.findAll.invalidate();
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir empresa', {
        description: error.message,
      });
    },
  });

  const filteredEmpresas = empresas.filter(
    (empresa) =>
      empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (empresa.nomeFantasia && empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      empresa.cnpj.includes(searchTerm.replace(/\D/g, '')),
  );

  // Função para formatar CNPJ
  const formatCnpj = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const header = (
    <PageHeader
      title="Gerenciamento de Empresas"
      subtitle="Gerencie empresas e informações corporativas"
      actions={[
        <Button key="nova-empresa" onClick={() => router.push('/admin/base/empresas/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando empresas...</div>
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
            <div className="text-red-500">Erro ao carregar empresas: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Empresas Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
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
                    <TableHead>Empresa</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>Unidades</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/base/empresas/${empresa.id}/edit`)}
                        >
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{empresa.razaoSocial}</div>
                            <div className="text-sm text-muted-foreground">{empresa.cnpj}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {empresa.nomeFantasia ? (
                          <div className="text-sm">{empresa.nomeFantasia}</div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Não informado</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {empresa.unidades && empresa.unidades.length > 0 ? (
                          <Badge variant="secondary">{empresa.unidades.length} unidade(s)</Badge>
                        ) : (
                          <div className="text-sm text-muted-foreground">Nenhuma</div>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/base/empresas/${empresa.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a empresa ${empresa.razaoSocial}?`)) {
                                  deleteEmpresaMutation.mutate({ id: empresa.id });
                                }
                              }}
                              disabled={deleteEmpresaMutation.isPending}
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
