import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ALL_ROLES, ALL_ROLES_DATA, MODULES_DATA } from "@/constants";
import type { UserRoleType } from "@/constants";
import { Crown, Search, Shield } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";

interface UserRolesManagerProps {
  userRoles: UserRoleType[];
  onRoleChange: (role: UserRoleType, isActive: boolean) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

export function UserRolesManager({
  userRoles,
  onRoleChange,
  className,
  readOnly = false,
}: UserRolesManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar roles baseado na busca
  const filteredRoles = Object.values(ALL_ROLES_DATA).filter(
    (roleData) =>
      roleData.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleData.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar roles por categoria
  const adminRoles = filteredRoles.filter(
    (role) =>
      role.value === ALL_ROLES.ADMIN || role.value === ALL_ROLES.SUPERADMIN
  );
  const modulesRoles = filteredRoles.filter(
    (role) =>
      !(role.value === ALL_ROLES.ADMIN || role.value === ALL_ROLES.SUPERADMIN)
  );
  const modules = modulesRoles
    .map((role) => (role.value as string).split("_")[0])
    .filter((value, index, self) => self.indexOf(value) === index);

  const RoleRow = ({
    roleData,
  }: {
    roleData: (typeof ALL_ROLES_DATA)[UserRoleType];
  }) => {
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
            <Badge
              variant={roleData.color || "secondary"}
              className="font-medium"
            >
              {roleData.label}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {roleData.description}
        </TableCell>
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
          <TableCell />
          <TableCell colSpan={2} className="font-medium py-3">
            <div className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
            </div>
          </TableCell>
        </TableRow>
        {roles.map((roleData) => {
          return <RoleRow key={roleData.value} roleData={roleData} />;
        })}
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
            <RoleSection
              title="Administração"
              roles={adminRoles}
              icon={<Crown className="h-4 w-4 text-red-500" />}
            />
            {modules.map((module) => {
              const moduleData = MODULES_DATA.find(
                (moduleData) => moduleData.module === module
              );
              return (
                <RoleSection
                  title={moduleData?.title || module}
                  roles={modulesRoles.filter((role) =>
                    role.value.startsWith(module)
                  )}
                  icon={<Shield className="h-4 w-4 text-blue-500" />}
                />
              );
            })}
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
