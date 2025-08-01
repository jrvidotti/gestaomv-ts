"use client";

import { AdminMain } from "@/components/layout/admin-main";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { useModuleTracking } from "@/hooks/use-module-tracking";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider } from "./sidebar";

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
			router.navigate({ to: "/login" });
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<SidebarProvider defaultOpen={false}>
			<AppSidebar />
			<AdminMain header={header || <PageHeader title="Gestão MV" />}>
				{children}
			</AdminMain>
		</SidebarProvider>
	);
}
