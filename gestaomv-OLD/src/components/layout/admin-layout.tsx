'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useModuleTracking } from '@/hooks/use-module-tracking';
import { PageHeader } from '@/components/layout/page-header';
import { AdminMain } from '@/components/layout/admin-main';

interface DashboardLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({ header, children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Rastrear navegação entre módulos
  useModuleTracking();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <AdminMain header={header || <PageHeader title="Gestão MV" />}>{children}</AdminMain>
    </SidebarProvider>
  );
}
