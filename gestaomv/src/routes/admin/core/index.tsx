import { RouteGuard } from "@/components/auth/route-guard";
import { CardStats } from "@/components/card-stats";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/integrations/trpc/react";
import { USER_ROLES } from "@/modules/core/enums";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
	Plus,
	Settings,
	Shield,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/core/")({
	component: AdminCoreDashboard,
});

function AdminCoreDashboard() {
	const trpc = useTRPC();

	// Queries tRPC
	const { data: userStats, isLoading: statsLoading } = useQuery(
		trpc.users.getUserStats.queryOptions(),
	);
	const { data: pendingUsers, isLoading: pendingLoading } = useQuery(
		trpc.users.findPendingUsers.queryOptions(),
	);

	const header = (
		<PageHeader
			title="Administração"
			subtitle="Painel de controle do sistema"
			actions={[
				<Button key="new-user" asChild>
					<Link to="/admin/core/users/novo">
						<Plus className="h-4 w-4 mr-2" />
						Novo Usuário
					</Link>
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Cards de Estatísticas */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<CardStats
							titulo="Total de Usuários"
							valor={statsLoading ? "..." : userStats?.total || 0}
							icone={Users}
							corIcone="text-blue-500"
						/>
						<CardStats
							titulo="Usuários Ativos"
							valor={statsLoading ? "..." : userStats?.active || 0}
							icone={UserCheck}
							corIcone="text-green-500"
						/>
						<CardStats
							titulo="Pendentes de Aprovação"
							valor={statsLoading ? "..." : userStats?.pending || 0}
							icone={UserPlus}
							corIcone="text-yellow-500"
						/>
						<CardStats
							titulo="Usuários Inativos"
							valor={statsLoading ? "..." : userStats?.inactive || 0}
							icone={Shield}
							corIcone="text-red-500"
						/>
					</div>

					{/* Tabela de Usuários Pendentes */}
					{pendingUsers && pendingUsers.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserPlus className="h-5 w-5 text-yellow-500" />
									Usuários Pendentes de Aprovação
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Usuário</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Data de Criação</TableHead>
											<TableHead>Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{pendingUsers.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="h-8 w-8">
															<AvatarImage
																src={`https://avatar.vercel.sh/${user.email}`}
															/>
															<AvatarFallback>
																{user.name
																	?.split(" ")
																	.map((n) => n[0])
																	.join("")
																	.toUpperCase() || "U"}
															</AvatarFallback>
														</Avatar>
														<span className="font-medium">{user.name}</span>
													</div>
												</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													{new Date(user.createdAt).toLocaleDateString("pt-BR")}
												</TableCell>
												<TableCell>
													<Button asChild size="sm">
														<Link
															to="/admin/core/users/$id/edit"
															params={{ id: user.id }}
														>
															Aprovar
														</Link>
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}

					{/* Cards de Ações Rápidas */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card className="cursor-pointer hover:bg-muted/50 transition-colors">
							<Link to="/admin/core/users" className="block">
								<CardContent className="pt-6">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold">Gerenciar Usuários</h3>
											<p className="text-sm text-muted-foreground">
												Visualizar e gerenciar todos os usuários
											</p>
										</div>
										<Users className="h-8 w-8 text-blue-500" />
									</div>
								</CardContent>
							</Link>
						</Card>

						<Card className="cursor-pointer hover:bg-muted/50 transition-colors">
							<Link to="/admin/core/configuracoes" className="block">
								<CardContent className="pt-6">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold">Configurações</h3>
											<p className="text-sm text-muted-foreground">
												Configurar parâmetros do sistema
											</p>
										</div>
										<Settings className="h-8 w-8 text-gray-500" />
									</div>
								</CardContent>
							</Link>
						</Card>
					</div>

					{/* Painel de Status do Sistema */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Status do Sistema
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span>Sistema de Usuários</span>
									<Badge variant="default">Operacional</Badge>
								</div>
								{userStats?.pending && userStats.pending > 0 && (
									<div className="flex items-center justify-between">
										<span>Usuários Pendentes</span>
										<Badge variant="secondary">
											{userStats.pending} pendente
											{userStats.pending > 1 ? "s" : ""}
										</Badge>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span>Configurações</span>
									<Badge variant="default">Configurado</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
