'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MultipleRoleBadges } from '@/components/role-badge';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES, USER_ROLES_DATA, UserRoleType } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading, error } = api.base.users.findAll.useQuery();

  const utils = api.useUtils();

  const toggleUserStatusMutation = api.base.users.update.useMutation({
    onSuccess: () => {
      utils.base.users.findAll.invalidate();
      toast.success('Status do usuário atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status do usuário', {
        description: error.message,
      });
    },
  });

  const deleteUserMutation = api.base.users.remove.useMutation({
    onSuccess: () => {
      utils.base.users.findAll.invalidate();
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir usuário', {
        description: error.message,
      });
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const header = (
    <PageHeader
      title="Gerenciamento de Usuários"
      subtitle="Gerencie usuários, permissões e acessos do sistema"
      actions={[
        <Button key="novo-usuario" onClick={() => router.push('/admin/base/users/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Gerenciamento de Usuários
              </h2>
              <p className="text-muted-foreground">Gerencie usuários, permissões e acessos do sistema</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando usuários...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Gerenciamento de Usuários
              </h2>
              <p className="text-muted-foreground">Gerencie usuários, permissões e acessos do sistema</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Erro ao carregar usuários: {error.message}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
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
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleData = USER_ROLES_DATA[user.roles[0] as UserRoleType];
                    console.log(roleData);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div
                            className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                            onClick={() => router.push(`/admin/base/users/${user.id}/edit`)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-primary hover:underline">{user.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <MultipleRoleBadges roles={user.roles} maxDisplay={2} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/base/users/${user.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  toggleUserStatusMutation.mutate({
                                    id: user.id,
                                    data: { isActive: !user.isActive },
                                  });
                                }}
                                disabled={toggleUserStatusMutation.isPending}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
                                    deleteUserMutation.mutate({ id: user.id });
                                  }
                                }}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
