import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckSquare, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/checklist/")({
	component: ChecklistDashboard,
});

function ChecklistDashboard() {
	const header = (
		<PageHeader
			title="Sistema de Checklist"
			subtitle="Gerencie templates de checklist e acompanhe avaliações de unidades"
		/>
	);

	return (
		<AdminLayout header={header}>
			<div className="space-y-6">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Templates Ativos
						</CardTitle>
						<CheckSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">
							Templates configurados
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avaliações Pendentes
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">
							Aguardando avaliação
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avaliações Concluídas
						</CardTitle>
						<CheckSquare className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">Este mês</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Média Geral</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">Todas as unidades</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckSquare className="h-5 w-5" />
							Templates de Checklist
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Configure formulários de avaliação para suas unidades
						</p>
					</CardHeader>
					<CardContent>
						<Link
							to="/admin/checklist/templates"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							Gerenciar Templates
						</Link>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Avaliações
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Realize avaliações das unidades e acompanhe o progresso
						</p>
					</CardHeader>
					<CardContent>
						<Link
							to="/admin/checklist/avaliacoes"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							Ver Avaliações
						</Link>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Relatórios
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Analise dados e compare performance entre unidades
						</p>
					</CardHeader>
					<CardContent>
						<Link
							to="/admin/checklist/relatorios"
							className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							Ver Relatórios
						</Link>
					</CardContent>
				</Card>
				</div>
			</div>
		</AdminLayout>
	);
}
