'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { LogOut, ChevronUp, User, Loader2, LayoutDashboard, Key } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { Link } from '@tanstack/react-router';
import { MODULES_DATA } from '@/constants';
import { MvLogo } from '@/components/icons/mv-logo';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { getAccessibleModules, canAccessPage } = usePermissions();
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [moduloSelecionado, setModuloSelecionado] = useState<string | undefined>(undefined);

  // Obter apenas módulos que o usuário tem acesso
  const accessibleModules = getAccessibleModules();

  // Sincronizar módulo selecionado com URL atual
  useEffect(() => {
    if (pathname.startsWith('/admin/')) {
      const pathSegments = pathname.split('/');
      const currentModule = pathSegments[2];

      // Verificar se é um módulo válido e o usuário tem acesso
      const isValidModule = currentModule && accessibleModules.some((m) => m.module === currentModule);

      if (isValidModule) {
        setModuloSelecionado(currentModule);
      } else {
        // Para módulos não reconhecidos, usar primeiro módulo disponível
        if (accessibleModules.length > 0) {
          setModuloSelecionado(accessibleModules[0].module);
        }
      }
    }
  }, [pathname, accessibleModules]);

  // Filtrar itens do menu baseado no módulo selecionado e permissões
  const itensMenu = accessibleModules.filter((item) => item.module === moduloSelecionado);

  const handleModuleChange = (novoModulo: string) => {
    setModuloSelecionado(novoModulo);
    router.navigate({ to: `/admin/${novoModulo}` });
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-12 items-center justify-center rounded-lg">
                  <MvLogo className="size-12" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gestão MV</span>
                  <span className="truncate text-xs">Sistema de Gestão</span>
                </div>
              </Link>
            </SidebarMenuButton>
            <SidebarTrigger className="-ml-1" />
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-1 pt-2">
          <Select
            value={moduloSelecionado}
            onValueChange={handleModuleChange}
            disabled={moduloSelecionado === undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Carregando...">
                {moduloSelecionado === undefined ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  moduloSelecionado &&
                  (() => {
                    const moduloAtual = MODULES_DATA.find((m) => m.module === moduloSelecionado);
                    return moduloAtual ? (
                      <div className="flex items-center gap-2">
                        <moduloAtual.icon className="h-4 w-4" />
                        {moduloAtual.title}
                      </div>
                    ) : null;
                  })()
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accessibleModules.map((modulo) => (
                <SelectItem key={modulo.module} value={modulo.module}>
                  <div className="flex items-center gap-2">
                    <modulo.icon className="h-4 w-4" />
                    {modulo.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {moduloSelecionado === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando módulo...</span>
                </div>
              </div>
            ) : (
              <SidebarMenu>
                {itensMenu.map((item) => (
                  <React.Fragment key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Painel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {item.items
                      ?.filter((subItem) => canAccessPage(subItem.url))
                      .map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </React.Fragment>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? 'Usuário'} />
                    <AvatarFallback className="rounded-lg">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1.5">
                  Tema:
                  <ThemeToggle />
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/admin/user/profile">
                    <User />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/user/alterar-senha">
                    <Key />
                    Alterar Senha
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
