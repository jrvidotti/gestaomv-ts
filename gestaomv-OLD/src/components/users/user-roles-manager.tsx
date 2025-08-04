'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { USER_ROLES_DATA, USER_ROLES, UserRoleType } from '@/shared';
import { Shield, Search, Crown } from 'lucide-react';

interface UserRolesManagerProps {
  userRoles: UserRoleType[];
  onRoleChange: (role: UserRoleType, isActive: boolean) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

export function UserRolesManager({ userRoles, onRoleChange, className, readOnly = false }: UserRolesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar roles baseado na busca
  const filteredRoles = Object.values(USER_ROLES_DATA).filter(
    (roleData) =>
      roleData.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleData.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Agrupar roles por categoria
  const adminRoles = filteredRoles.filter((role) => role.value === USER_ROLES.ADMIN);
  const managementRoles = filteredRoles.filter((role) => role.value.startsWith('gerencia_'));
  const basicRoles = filteredRoles.filter((role) => role.value.startsWith('usuario_'));

  const RoleRow = ({ roleData }: { roleData: (typeof USER_ROLES_DATA)[UserRoleType] }) => {
    const isActive = userRoles.includes(roleData.value);

    return (
      <TableRow key={roleData.value}>
        <TableCell>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => onRoleChange(roleData.value, checked)}
            disabled={readOnly}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Badge variant={roleData.color || 'secondary'} className="font-medium">
              {roleData.label}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{roleData.description}</TableCell>
      </TableRow>
    );
  };

  const RoleSection = ({
    title,
    roles,
    icon,
  }: {
    title: string;
    roles: typeof filteredRoles;
    icon: React.ReactNode;
  }) => {
    if (roles.length === 0) return null;

    return (
      <>
        <TableRow className="bg-muted/20">
          <TableCell></TableCell>
          <TableCell colSpan={2} className="font-medium py-3">
            <div className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
            </div>
          </TableCell>
        </TableRow>
        {roles.map((roleData) => (
          <RoleRow key={roleData.value} roleData={roleData} />
        ))}
      </>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Funções e permissões do usuário
        </CardTitle>

        {/* Busca */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tabela de Roles */}
        <Table>
          <TableBody>
            <RoleSection title="Administração" roles={adminRoles} icon={<Crown className="h-4 w-4 text-red-500" />} />
            <RoleSection
              title="Gerenciamento"
              roles={managementRoles}
              icon={<Shield className="h-4 w-4 text-blue-500" />}
            />
            <RoleSection
              title="Funções Básicas"
              roles={basicRoles}
              icon={<Shield className="h-4 w-4 text-gray-500" />}
            />
          </TableBody>
        </Table>

        {filteredRoles.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma função encontrada para &quot;{searchTerm}&quot;
          </div>
        )}
      </CardContent>
    </Card>
  );
}
