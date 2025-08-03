"use client";

import { SidebarProvider } from '@/components/ui/sidebar';
import { getSidebarState } from '@/lib/cookies';
import { useEffect, useState } from 'react';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

/**
 * Componente cliente que gerencia persistência do estado da sidebar
 * usando estado controlado e sincronização com cookies
 */
export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar estado a partir do cookie
  useEffect(() => {
    const savedState = getSidebarState();
    setSidebarOpen(savedState);
    setIsInitialized(true);
  }, []);

  // Sincronizar mudanças de estado
  // Nota: O SidebarProvider já salva o cookie internamente,
  // então só precisamos atualizar nosso estado local
  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    // Removido setSidebarState(open) para evitar dupla escrita
    // O SidebarProvider já gerencia o cookie automaticamente
  };

  // Aguardar inicialização para evitar hydration mismatch
  if (!isInitialized) {
    return (
      <SidebarProvider 
        defaultOpen={true}
        open={true}
        onOpenChange={() => {}}
      >
        {children}
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider 
      open={sidebarOpen}
      onOpenChange={handleOpenChange}
    >
      {children}
    </SidebarProvider>
  );
}
