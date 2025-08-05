import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ResultadoImportacao } from "@/modules/core/dtos";
import { USER_ROLES } from "@/modules/core/enums";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	Briefcase,
	Building2,
	CheckCircle,
	Download,
	FileText,
	RefreshCw,
	RotateCcw,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/importacao-pontoweb/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [modoAtualizar, setModoAtualizar] = useState(false);
	const [diasRetroativos, setDiasRetroativos] = useState(30);
	const [ultimoResultado, setUltimoResultado] =
		useState<ResultadoImportacao | null>(null);
	const [mostrarApenasResultado, setMostrarApenasResultado] = useState(false);

	const trpc = useTRPC();

	// Mutations
	const { mutate: importarFuncionarios, isPending: importandoFuncionarios } =
		useMutation({
			...trpc.rh.pontoweb.importarFuncionarios.mutationOptions(),
			onSuccess: (resultado) => {
				setUltimoResultado(resultado);
				toast.success("Importação de funcionários concluída com sucesso!");
				setMostrarApenasResultado(false);
			},
			onError: (error) => {
				toast.error(`Erro na importação: ${error.message}`);
				setMostrarApenasResultado(false);
			},
		});

	const {
		mutate: sincronizarAfastamentos,
		isPending: sincronizandoAfastamentos,
	} = useMutation({
		...trpc.rh.pontoweb.sincronizarAfastamentos.mutationOptions(),
		onSuccess: (resultado) => {
			toast.success(
				`${resultado.afastamentos} afastamentos sincronizados com sucesso!`,
			);
			if (resultado.erros.length > 0) {
				toast.warning(
					`${resultado.erros.length} erros encontrados na sincronização.`,
				);
			}
		},
		onError: (error) => {
			toast.error(`Erro na sincronização: ${error.message}`);
		},
	});

	// Query para motivos de demissão
	const { data: motivosDemissao, isLoading: carregandoMotivos } = useQuery(
		trpc.rh.pontoweb.obterMotivosDemissao.queryOptions(),
	);

	const executarImportacao = async () => {
		try {
			setMostrarApenasResultado(true);
			importarFuncionarios({ modoAtualizar });
		} catch (error) {
			setMostrarApenasResultado(false);
		}
	};

	const executarSincronizacao = async () => {
		try {
			sincronizarAfastamentos({ diasRetroativos });
		} catch (error) {
			// Erro já tratado no onError
		}
	};

	const calcularTotalImportados = (resultado: ResultadoImportacao) => {
		return (
			resultado.empresas.importadas +
			resultado.unidades.importadas +
			resultado.departamentos.importadas +
			resultado.cargos.importados +
			resultado.funcionarios.importados
		);
	};

	const calcularTotalAtualizados = (resultado: ResultadoImportacao) => {
		return (
			resultado.empresas.atualizadas +
			resultado.unidades.atualizadas +
			resultado.departamentos.atualizadas +
			resultado.cargos.atualizados +
			resultado.funcionarios.atualizados
		);
	};

	const calcularTotalErros = (resultado: ResultadoImportacao) => {
		return (
			resultado.empresas.erros.length +
			resultado.unidades.erros.length +
			resultado.departamentos.erros.length +
			resultado.cargos.erros.length +
			resultado.funcionarios.erros.length
		);
	};

	const header = (
		<PageHeader
			title="Importação PontoWeb"
			subtitle="Sincronizar dados de funcionários, afastamentos e estruturas do PontoWeb"
		/>
	);

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Seção de Importação de Funcionários */}
					{!mostrarApenasResultado && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Download className="h-5 w-5" />
									Importação de Funcionários
								</CardTitle>
								<CardDescription>
									Importar funcionários e estruturas organizacionais do PontoWeb
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch
										id="modo-atualizar"
										checked={modoAtualizar}
										onCheckedChange={setModoAtualizar}
										disabled={importandoFuncionarios}
									/>
									<Label htmlFor="modo-atualizar">
										Modo Atualizar (atualiza funcionários existentes)
									</Label>
								</div>

								<Button
									onClick={executarImportacao}
									disabled={importandoFuncionarios}
									className="w-full"
								>
									{importandoFuncionarios ? (
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Download className="h-4 w-4 mr-2" />
									)}
									{importandoFuncionarios
										? "Importando..."
										: "Importar Funcionários"}
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Seção de Sincronização de Afastamentos */}
					{!mostrarApenasResultado && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<RotateCcw className="h-5 w-5" />
									Sincronização de Afastamentos
								</CardTitle>
								<CardDescription>
									Sincronizar afastamentos dos funcionários do PontoWeb
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="dias-retroativos">
										Dias Retroativos (máximo 365)
									</Label>
									<Input
										id="dias-retroativos"
										type="number"
										min="1"
										max="365"
										value={diasRetroativos}
										onChange={(e) => setDiasRetroativos(Number(e.target.value))}
										disabled={sincronizandoAfastamentos}
									/>
								</div>

								<Button
									onClick={executarSincronizacao}
									disabled={sincronizandoAfastamentos}
									className="w-full"
								>
									{sincronizandoAfastamentos ? (
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<RotateCcw className="h-4 w-4 mr-2" />
									)}
									{sincronizandoAfastamentos
										? "Sincronizando..."
										: "Sincronizar Afastamentos"}
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Seção de Motivos de Demissão */}
					{!mostrarApenasResultado && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Motivos de Demissão
								</CardTitle>
								<CardDescription>
									Motivos de demissão disponíveis no PontoWeb
								</CardDescription>
							</CardHeader>
							<CardContent>
								{carregandoMotivos ? (
									<div className="flex items-center justify-center py-8">
										<RefreshCw className="h-6 w-6 animate-spin mr-2" />
										<span>Carregando motivos...</span>
									</div>
								) : motivosDemissao?.motivos.length ? (
									<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
										{motivosDemissao.motivos.map((motivo) => (
											<div
												key={motivo.id}
												className="flex items-center gap-2 p-2 border rounded"
											>
												{motivo.ativo ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<AlertCircle className="h-4 w-4 text-gray-400" />
												)}
												<span className="flex-1">{motivo.descricao}</span>
												{motivo.codigo && (
													<Badge variant="outline" className="text-xs">
														{motivo.codigo}
													</Badge>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										Nenhum motivo de demissão encontrado
									</div>
								)}

								{motivosDemissao?.erros.length ? (
									<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
										<div className="flex items-center gap-2 text-red-800 font-medium mb-2">
											<AlertCircle className="h-4 w-4" />
											Erros encontrados:
										</div>
										<ul className="space-y-1 text-sm text-red-700">
											{motivosDemissao.erros.map((erro) => (
												<li key={erro}>• {erro}</li>
											))}
										</ul>
									</div>
								) : null}
							</CardContent>
						</Card>
					)}

					{/* Spinner durante importação */}
					{mostrarApenasResultado &&
						!ultimoResultado &&
						importandoFuncionarios && (
							<Card>
								<CardContent className="flex flex-col items-center justify-center py-12">
									<RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Importando funcionários...
									</h3>
									<p className="text-sm text-gray-600 text-center">
										Aguarde enquanto processamos os dados do PontoWeb
									</p>
								</CardContent>
							</Card>
						)}

					{/* Resultados da Última Importação */}
					{ultimoResultado && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle className="h-5 w-5 text-green-500" />
									Resultado da Última Importação
								</CardTitle>
								<CardDescription>
									Resumo das operações realizadas
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Resumo Geral */}
								<div className="grid gap-4 md:grid-cols-4">
									<div className="text-center p-4 bg-green-50 rounded-lg">
										<div className="text-2xl font-bold text-green-600">
											{calcularTotalImportados(ultimoResultado)}
										</div>
										<div className="text-sm text-green-800">
											Novos Registros
										</div>
									</div>
									<div className="text-center p-4 bg-blue-50 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">
											{calcularTotalAtualizados(ultimoResultado)}
										</div>
										<div className="text-sm text-blue-800">Atualizados</div>
									</div>
									<div className="text-center p-4 bg-yellow-50 rounded-lg">
										<div className="text-2xl font-bold text-yellow-600">
											{ultimoResultado.funcionarios.ignorados}
										</div>
										<div className="text-sm text-yellow-800">Ignorados</div>
									</div>
									<div className="text-center p-4 bg-red-50 rounded-lg">
										<div className="text-2xl font-bold text-red-600">
											{calcularTotalErros(ultimoResultado)}
										</div>
										<div className="text-sm text-red-800">Erros</div>
									</div>
								</div>

								{/* Detalhes por Categoria */}
								<div className="grid gap-4 md:grid-cols-2">
									{/* Empresas */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 font-medium">
											<Building2 className="h-4 w-4" />
											Empresas
										</div>
										<div className="text-sm space-y-1">
											<div>
												Importadas: {ultimoResultado.empresas.importadas}
											</div>
											<div>
												Atualizadas: {ultimoResultado.empresas.atualizadas}
											</div>
											{ultimoResultado.empresas.erros.length > 0 && (
												<div className="text-red-600">
													Erros: {ultimoResultado.empresas.erros.length}
												</div>
											)}
										</div>
									</div>

									{/* Unidades */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 font-medium">
											<Building2 className="h-4 w-4" />
											Unidades
										</div>
										<div className="text-sm space-y-1">
											<div>
												Importadas: {ultimoResultado.unidades.importadas}
											</div>
											<div>
												Atualizadas: {ultimoResultado.unidades.atualizadas}
											</div>
											{ultimoResultado.unidades.erros.length > 0 && (
												<div className="text-red-600">
													Erros: {ultimoResultado.unidades.erros.length}
												</div>
											)}
										</div>
									</div>

									{/* Departamentos */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 font-medium">
											<Building2 className="h-4 w-4" />
											Departamentos
										</div>
										<div className="text-sm space-y-1">
											<div>
												Importados: {ultimoResultado.departamentos.importadas}
											</div>
											<div>
												Atualizados: {ultimoResultado.departamentos.atualizadas}
											</div>
											{ultimoResultado.departamentos.erros.length > 0 && (
												<div className="text-red-600">
													Erros: {ultimoResultado.departamentos.erros.length}
												</div>
											)}
										</div>
									</div>

									{/* Cargos */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 font-medium">
											<Briefcase className="h-4 w-4" />
											Cargos
										</div>
										<div className="text-sm space-y-1">
											<div>Importados: {ultimoResultado.cargos.importados}</div>
											<div>
												Atualizados: {ultimoResultado.cargos.atualizados}
											</div>
											{ultimoResultado.cargos.erros.length > 0 && (
												<div className="text-red-600">
													Erros: {ultimoResultado.cargos.erros.length}
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Funcionários - Destaque */}
								<div className="p-4 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-2 font-medium mb-3">
										<Users className="h-5 w-5" />
										Funcionários
									</div>
									<div className="grid gap-2 md:grid-cols-4 text-sm">
										<div>
											<span className="font-medium text-green-600">
												{ultimoResultado.funcionarios.importados}
											</span>
											<span className="text-gray-600 ml-1">importados</span>
										</div>
										<div>
											<span className="font-medium text-blue-600">
												{ultimoResultado.funcionarios.atualizados}
											</span>
											<span className="text-gray-600 ml-1">atualizados</span>
										</div>
										<div>
											<span className="font-medium text-yellow-600">
												{ultimoResultado.funcionarios.ignorados}
											</span>
											<span className="text-gray-600 ml-1">ignorados</span>
										</div>
										<div>
											<span className="font-medium text-red-600">
												{ultimoResultado.funcionarios.erros.length}
											</span>
											<span className="text-gray-600 ml-1">erros</span>
										</div>
									</div>
								</div>

								{/* Lista de Erros (se houver) */}
								{calcularTotalErros(ultimoResultado) > 0 && (
									<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
										<div className="flex items-center gap-2 text-red-800 font-medium mb-3">
											<AlertCircle className="h-4 w-4" />
											Erros Encontrados
										</div>
										<div className="space-y-3 text-sm">
											{ultimoResultado.empresas.erros.length > 0 && (
												<div>
													<div className="font-medium text-red-700">
														Empresas:
													</div>
													<ul className="list-disc list-inside text-red-600 ml-2">
														{ultimoResultado.empresas.erros.map((erro) => (
															<li key={erro}>{erro}</li>
														))}
													</ul>
												</div>
											)}
											{ultimoResultado.unidades.erros.length > 0 && (
												<div>
													<div className="font-medium text-red-700">
														Unidades:
													</div>
													<ul className="list-disc list-inside text-red-600 ml-2">
														{ultimoResultado.unidades.erros.map((erro) => (
															<li key={erro}>{erro}</li>
														))}
													</ul>
												</div>
											)}
											{ultimoResultado.departamentos.erros.length > 0 && (
												<div>
													<div className="font-medium text-red-700">
														Departamentos:
													</div>
													<ul className="list-disc list-inside text-red-600 ml-2">
														{ultimoResultado.departamentos.erros.map((erro) => (
															<li key={erro}>{erro}</li>
														))}
													</ul>
												</div>
											)}
											{ultimoResultado.cargos.erros.length > 0 && (
												<div>
													<div className="font-medium text-red-700">
														Cargos:
													</div>
													<ul className="list-disc list-inside text-red-600 ml-2">
														{ultimoResultado.cargos.erros.map((erro) => (
															<li key={erro}>{erro}</li>
														))}
													</ul>
												</div>
											)}
											{ultimoResultado.funcionarios.erros.length > 0 && (
												<div>
													<div className="font-medium text-red-700">
														Funcionários:
													</div>
													<ul className="list-disc list-inside text-red-600 ml-2">
														{ultimoResultado.funcionarios.erros.map((erro) => (
															<li key={erro}>{erro}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Botão para nova importação */}
								<div className="flex justify-center pt-4">
									<Button
										variant="outline"
										onClick={() => {
											setMostrarApenasResultado(false);
											setUltimoResultado(null);
										}}
									>
										Nova Importação
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
