"use client";

import { LookupSelect } from "@/components/lookup-select";
import { Thumbnail } from "@/components/thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Package, Plus, Search, X } from "lucide-react";
import { useState } from "react";

export interface MaterialSelecionado {
	materialId: number;
	nome: string;
	foto?: string | null;
	tipoMaterial?: { nome: string } | null;
	unidadeMedida?: { nome: string } | null;
	valorUnitario: number;
	qtdSolicitada: number;
}

interface MaterialSelectorProps {
	materiais: MaterialSelecionado[];
	onChange: (materiais: MaterialSelecionado[]) => void;
	disabled?: boolean;
}

export function MaterialSelector({
	materiais,
	onChange,
	disabled = false,
}: MaterialSelectorProps) {
	const [busca, setBusca] = useState("");
	const [tipoSelecionadoId, setTipoSelecionadoId] = useState<string | null>(
		null,
	);

	const trpc = useTRPC();

	const buscaDebounced = useDebounce(busca, 300);

	// Query para buscar materiais ativos
	const { data: materiaisDisponiveis, isLoading: carregandoMateriais } =
		useQuery(
			trpc.almoxarifado.materiais.listar.queryOptions({
				ativo: true,
				busca: buscaDebounced || undefined,
				tipoMaterialId:
					tipoSelecionadoId && tipoSelecionadoId !== "all"
						? tipoSelecionadoId
						: undefined,
				limite: 100, // Limitar para performance
			}),
		);

	// Query para tipos de material
	const { data: tiposMaterialData, isLoading: isLoadingTiposMaterial } =
		useQuery(trpc.almoxarifado.materiais.listarTiposMaterial.queryOptions());

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const isMaterialSelecionado = (materialId: number) => {
		return materiais.some((m) => m.materialId === materialId);
	};

	const getMaterialSelecionado = (materialId: number) => {
		return materiais.find((m) => m.materialId === materialId);
	};

	const adicionarMaterial = (material: {
		id: number;
		nome: string;
		foto?: string | null;
		tipoMaterial?: { nome: string } | null;
		unidadeMedida?: { nome: string } | null;
		valorUnitario: number;
	}) => {
		if (isMaterialSelecionado(material.id)) return;

		const novoMaterial: MaterialSelecionado = {
			materialId: material.id,
			nome: material.nome,
			foto: material.foto,
			tipoMaterial: material.tipoMaterial,
			unidadeMedida: material.unidadeMedida,
			valorUnitario: material.valorUnitario,
			qtdSolicitada: 1,
		};

		onChange([...materiais, novoMaterial]);
	};

	const removerMaterial = (materialId: number) => {
		onChange(materiais.filter((m) => m.materialId !== materialId));
	};

	const atualizarQuantidade = (materialId: number, novaQuantidade: number) => {
		if (novaQuantidade <= 0) {
			removerMaterial(materialId);
			return;
		}

		onChange(
			materiais.map((m) =>
				m.materialId === materialId
					? { ...m, qtdSolicitada: novaQuantidade }
					: m,
			),
		);
	};

	const limparFiltros = () => {
		setBusca("");
		setTipoSelecionadoId("all");
	};

	return (
		<div className="space-y-6">
			{/* Grid de Materiais Disponíveis com Filtros Integrados */}
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Package className="h-5 w-5" />
								Materiais Disponíveis
							</CardTitle>
							{materiais.length > 0 && (
								<div className="text-sm text-muted-foreground">
									{materiais.length}{" "}
									{materiais.length === 1
										? "material selecionado"
										: "materiais selecionados"}{" "}
									/ Total:{" "}
									{formatCurrency(
										materiais.reduce(
											(total, m) => total + m.valorUnitario * m.qtdSolicitada,
											0,
										),
									)}
								</div>
							)}
						</div>

						{/* Filtros Integrados */}
						<div className="flex flex-col gap-3 md:flex-row md:items-end">
							<div className="flex-1">
								<div className="relative">
									<Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
									<Input
										placeholder="Buscar por nome..."
										value={busca}
										onChange={(e) => setBusca(e.target.value)}
										className="pl-9"
										disabled={disabled}
									/>
								</div>
							</div>
							<div className="min-w-[200px]">
								<LookupSelect
									value={tipoSelecionadoId ?? "all"}
									onValueChange={(val) =>
										setTipoSelecionadoId(val && val !== "all" ? val : null)
									}
									options={
										tiposMaterialData?.map((e) => ({
											value: e.id.toString(),
											label: e.nome,
										})) ?? []
									}
									placeholder="Filtrar por tipo"
									emptyMessage={
										isLoadingTiposMaterial ? "Carregando..." : "Todos os tipos"
									}
									disabled={disabled || isLoadingTiposMaterial}
								/>
							</div>
							<Button
								variant="outline"
								type="button"
								onClick={limparFiltros}
								disabled={disabled}
								size="sm"
							>
								Limpar
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{carregandoMateriais ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{Array.from({ length: 6 }).map((_, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									className="border rounded-lg p-4 animate-pulse"
								>
									<div className="w-16 h-16 bg-muted rounded mb-3" />
									<div className="h-4 bg-muted rounded mb-2" />
									<div className="h-3 bg-muted rounded w-2/3 mb-2" />
									<div className="h-3 bg-muted rounded w-1/2" />
								</div>
							))}
						</div>
					) : !materiaisDisponiveis?.materiais.length ? (
						<div className="text-center py-8">
							<Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								Nenhum material encontrado
							</h3>
							<p className="text-muted-foreground">
								Tente ajustar os filtros para encontrar materiais.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{materiaisDisponiveis.materiais.map((material) => {
								const selecionado = isMaterialSelecionado(material.id);
								const materialSelecionado = getMaterialSelecionado(material.id);

								return (
									<div
										key={material.id}
										className={`border rounded-lg p-4 transition-all relative ${
											selecionado
												? "border-primary bg-primary/5 shadow-md"
												: "border-border hover:border-primary/50 hover:shadow-sm"
										}`}
									>
										<div className="flex gap-3">
											<Thumbnail
												src={material.foto}
												alt={material.nome}
												size={64}
												fallbackIcon={Package}
												className="flex-shrink-0"
											/>
											<div className="flex-1 min-w-0 pr-6">
												<h4
													className="font-medium text-sm mb-1 truncate"
													title={material.nome}
												>
													{material.nome}
												</h4>
												<div className="space-y-1">
													<Badge variant="outline" className="text-xs">
														{material.tipoMaterial?.nome || "Sem tipo"}
													</Badge>
													<div className="text-xs text-muted-foreground">
														<p>
															{formatCurrency(material.valorUnitario)}/
															{material.unidadeMedida?.nome}
														</p>
													</div>
												</div>
											</div>
										</div>

										<div className="mt-3">
											{selecionado ? (
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-2">
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() =>
																atualizarQuantidade(
																	material.id,
																	(materialSelecionado?.qtdSolicitada || 1) - 1,
																)
															}
															disabled={disabled}
															className="h-8 w-8 p-0"
														>
															<Minus className="h-3 w-3" />
														</Button>
														<Input
															value={materialSelecionado?.qtdSolicitada || 1}
															onChange={(e) => {
																const novaQtd =
																	Number.parseInt(e.target.value) || 1;
																if (novaQtd >= 0) {
																	atualizarQuantidade(material.id, novaQtd);
																}
															}}
															disabled={disabled}
															className="h-8 w-16 text-center text-sm"
														/>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() =>
																atualizarQuantidade(
																	material.id,
																	(materialSelecionado?.qtdSolicitada || 1) + 1,
																)
															}
															disabled={disabled}
															className="h-8 w-8 p-0"
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
													{/* <span className="text-xs text-muted-foreground ml-auto">{material.unidadeMedida?.nome}</span> */}

													{selecionado && (
														<>
															<p className="font-medium">
																{formatCurrency(
																	material.valorUnitario *
																		(materialSelecionado?.qtdSolicitada || 1),
																)}
															</p>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => removerMaterial(material.id)}
																disabled={disabled}
																className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
															>
																<X className="h-3 w-3" />
															</Button>
														</>
													)}
												</div>
											) : (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => adicionarMaterial(material)}
													disabled={disabled}
													className="w-full"
												>
													<Plus className="h-3 w-3 mr-1" />
													Adicionar
												</Button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
