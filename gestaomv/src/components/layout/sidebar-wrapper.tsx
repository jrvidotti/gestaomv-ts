import { getSidebarStateServer } from '@/lib/cookies-server';
import { SidebarProvider } from '@/components/ui/sidebar';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

/**
 * Componente servidor que lê o estado da sidebar dos cookies
 * e repassa para o SidebarProvider
 */
export async function SidebarWrapper({ children }: SidebarWrapperProps) {
  const defaultOpen = await getSidebarStateServer();

  return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>;
}
