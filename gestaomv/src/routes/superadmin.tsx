import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MigrationStatusDTO } from "@/modules/core/dtos";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/superadmin")({
	component: SuperadminPage,
});

function SuperadminPage() {
	const trpc = useTRPC();
	const [operationLog, setOperationLog] = useState<string[]>([]);
	const [showOnlyLog, setShowOnlyLog] = useState(false);

	const { data: systemInfoData, isLoading: systemLoading } = useQuery(
		trpc.superadmin.buscarInfoSistema.queryOptions(),
	);

	// Queries
	const {
		data: statsData,
		isLoading: statsLoading,
		refetch: refetchStats,
	} = useQuery(trpc.superadmin.buscarStatsSistema.queryOptions());

	const {
		data: migrationInfoData,
		isLoading: migrationLoading,
		refetch: refetchMigrationInfo,
	} = useQuery(trpc.superadmin.buscarInfoMigracoes.queryOptions());

	const addLog = useCallback((message: string, timestamp?: string) => {
		const timestamp2 = timestamp || new Date().toLocaleTimeString();
		setOperationLog((prev) => [...prev, `[${timestamp2}] ${message}`]);
	}, []);

	const runMigrationsMutation = useMutation(
		trpc.superadmin.executarMigracoes.mutationOptions({
			onSuccess: (result) => {
				if (result.success) {
					addLog(`✅ ${result.message || "Migrações aplicadas com sucesso!"}`);
					refetchStats();
					refetchMigrationInfo();
				} else {
					addLog(`❌ Erro ao aplicar migrações: ${result.message}`);
				}
			},
			onError: (result) => {
				console.log(result);
				addLog("❌ Erro ao aplicar migrações!");
			},
		}),
	);

	const runSeedMutation = useMutation(
		trpc.superadmin.operacaoSeed.mutationOptions({
			onSuccess: (result) => {
				if (result.success) {
					addLog(`✅ Sucesso: ${result.operation}!`);
					refetchStats();
					refetchMigrationInfo();
				} else {
					addLog(`❌ Erro ao aplicar seed: ${result.operation}`);
				}
				for (const output of result.outputs) {
					addLog(output.message, output.timestamp);
				}
			},
			onError: (result) => {
				console.log(result);
				addLog("❌ Erro ao aplicar seed!");
			},
		}),
	);

	const loading = systemLoading || statsLoading || migrationLoading;

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
					<p>Carregando dashboard...</p>
				</div>
			</div>
		);
	}

	function runMigrations(): void {
		setShowOnlyLog(true);
		addLog("🔄 Iniciando aplicação de migrações...");
		runMigrationsMutation.mutate();
	}

	function runSeedOperation(operation: "import" | "export"): void {
		setShowOnlyLog(true);
		addLog(`🔄 Iniciando operação de seed: ${operation}...`);
		runSeedMutation.mutate({ operation });
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">🛠️ Superadmin Dashboard</h1>
				<Badge variant="secondary">
					Ambiente: {systemInfoData?.application.environment}
				</Badge>
			</div>

			{!showOnlyLog && (
				<>
					{/* Informações do Sistema */}
					<Card>
						<CardHeader>
							<CardTitle>🖥️ Informações do Sistema</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								<div>
									<h4 className="font-semibold mb-2">Aplicação</h4>
									<div className="text-sm space-y-1">
										<p>
											<strong>Nome:</strong> {systemInfoData?.application.name}
										</p>
										<p>
											<strong>Versão:</strong>{" "}
											{systemInfoData?.application.version}
										</p>
										<p>
											<strong>Node.js:</strong>{" "}
											{systemInfoData?.application.nodeVersion}
										</p>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Banco de Dados</h4>
									<div className="text-sm space-y-1">
										<p>
											<strong>Arquivo:</strong> {systemInfoData?.database.path}
										</p>
										<p>
											<strong>Tamanho:</strong> {systemInfoData?.database.size}
										</p>
										<p>
											<strong>Status:</strong>
											<Badge
												variant={
													systemInfoData?.database.exists
														? "default"
														: "destructive"
												}
												className="ml-2"
											>
												{systemInfoData?.database.exists ? "Conectado" : "Erro"}
											</Badge>
										</p>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Servidor</h4>
									<div className="text-sm space-y-1">
										<p>
											<strong>Porta:</strong> {systemInfoData?.server.port}
										</p>
										<p>
											<strong>Uptime:</strong> {systemInfoData?.server.uptime}
										</p>
										<p>
											<strong>Memória (RSS):</strong>{" "}
											{systemInfoData?.server.memoryUsage.rss}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>🔄 Migrações</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col lg:flex-row items-center justify-between gap-4">
								<div className="text-sm text-muted-foreground">
									<p>
										Total:
										<Badge variant="outline" className="mx-1">
											{migrationInfoData?.summary?.total || 0}
										</Badge>{" "}
										| Aplicadas:{" "}
										<Badge variant="default" className="mx-1">
											{migrationInfoData?.summary?.applied || 0}
										</Badge>{" "}
										| Pendentes:{" "}
										<Badge variant="secondary">
											{migrationInfoData?.summary?.pending || 0}
										</Badge>
									</p>
									<p>
										Pasta:{" "}
										<code className="text-xs">
											{migrationInfoData?.migrationsFolder}
										</code>
									</p>
								</div>
								<Button
									onClick={() => runMigrations()}
									variant="secondary"
									disabled={migrationInfoData?.summary?.pending === 0}
								>
									Aplicar Migrações Pendentes (
									{migrationInfoData?.summary?.pending || 0})
								</Button>
							</div>

							{/* Lista detalhada de migrações pendentes */}
							{migrationInfoData?.migrationsStatus &&
								migrationInfoData.migrationsStatus.filter(
									(m) => m.status === "pending",
								).length > 0 && (
									<div className="space-y-2 max-h-40 overflow-y-auto">
										<h4 className="text-sm font-semibold">
											Migrações Pendentes:
										</h4>
										{migrationInfoData.migrationsStatus
											.filter(
												(migration: MigrationStatusDTO) =>
													migration.status === "pending",
											)
											.map((migration: MigrationStatusDTO) => (
												<div
													key={migration.idx}
													className="flex items-center justify-between text-xs p-2 bg-muted rounded"
												>
													<div className="flex flex-col">
														<span className="font-mono">{migration.tag}</span>
														<span className="text-muted-foreground text-xs">
															#{migration.idx}
														</span>
													</div>
													<Badge variant="secondary" className="text-xs w-24">
														⏳ Pendente
													</Badge>
												</div>
											))}
									</div>
								)}
						</CardContent>
					</Card>

					{/* Estatísticas do Banco */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>📊 Módulo Base</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between">
									<span>Usuários:</span>
									<Badge>{statsData?.base.users}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Empresas:</span>
									<Badge>{statsData?.base.empresas}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Unidades:</span>
									<Badge>{statsData?.base.unidades}</Badge>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>👥 Módulo RH</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between">
									<span>Funcionários:</span>
									<Badge>{statsData?.rh.funcionarios}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Departamentos:</span>
									<Badge>{statsData?.rh.departamentos}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Equipes:</span>
									<Badge>{statsData?.rh.equipes}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Cargos:</span>
									<Badge>{statsData?.rh.cargos}</Badge>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>📦 Almoxarifado</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between">
									<span>Materiais:</span>
									<Badge>{statsData?.almoxarifado.materiais}</Badge>
								</div>
								<div className="flex justify-between">
									<span>Solicitações:</span>
									<Badge>{statsData?.almoxarifado.solicitacoes}</Badge>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Operações Administrativas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>🌱 Operações de Seed</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-sm text-muted-foreground mb-4">
									<p>Gerenciar dados de seed do sistema</p>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={() => runSeedOperation("export")}
										variant="outline"
										className="flex-1"
									>
										Exportar Dados
									</Button>
									<Button
										onClick={() => runSeedOperation("import")}
										variant="outline"
										className="flex-1"
									>
										Importar Dados
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</>
			)}

			{/* Log de Operações */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>📝 Log de Operações</CardTitle>
						{showOnlyLog && (
							<Button
								onClick={() => setShowOnlyLog(false)}
								variant="outline"
								size="sm"
							>
								← Voltar
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{operationLog.length > 0 ? (
						<div className="font-mono text-sm bg-muted p-4 rounded-md">
							{operationLog.map((log, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<div key={index} className="mb-1">
									{log}
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-sm">
							Nenhuma operação executada ainda.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
