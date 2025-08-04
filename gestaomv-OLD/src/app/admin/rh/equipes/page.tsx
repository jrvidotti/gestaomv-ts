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
import { Users2, Plus, Search, MoreHorizontal, Edit, Trash2, User } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function EquipesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: equipesData, isLoading, error } = api.rh.listarEquipes.useQuery({});

  const utils = api.useUtils();

  const deleteEquipeMutation = api.rh.deletarEquipe.useMutation({
    onSuccess: () => {
      utils.rh.listarEquipes.invalidate();
      toast.success('Equipe excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir equipe', {
        description: error.message,
      });
    },
  });

  const equipes = equipesData?.equipes || [];

  const filteredEquipes = equipes.filter((equipe) => equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const header = (
    <PageHeader
      title="Gerenciamento de Equipes"
      subtitle="Gerencie equipes e seus membros"
      actions={[
        <Button key="nova-equipe" onClick={() => router.push('/admin/rh/equipes/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Equipe
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando equipes...</div>
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
            <div className="text-red-500">Erro ao carregar equipes: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Equipes Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipes..."
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
                    <TableHead>Equipe</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipes.map((equipe) => (
                    <TableRow key={equipe.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => router.push(`/admin/rh/equipes/${equipe.id}/edit`)}
                        >
                          <Users2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-primary hover:underline">{equipe.nome}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">Não informado</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">Sem líder</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">0 membros</Badge>
                      </TableCell>
                      <TableCell>
                        {equipe.criadoEm ? new Date(equipe.criadoEm).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/rh/equipes/${equipe.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a equipe ${equipe.nome}?`)) {
                                  deleteEquipeMutation.mutate({ id: equipe.id });
                                }
                              }}
                              disabled={deleteEquipeMutation.isPending}
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
