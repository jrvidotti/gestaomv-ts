"use client";

import { Thumbnail } from "@/components/thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { STATUS_SOLICITACAO } from "@/modules/almoxarifado/enums";
import type { StatusSolicitacaoType } from "@/modules/almoxarifado/types";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { Check, Edit, Package, X } from "lucide-react";
import { useState } from "react";

export interface MaterialVisualizacao {
	id?: number; // ID do item da solicitação
	materialId: number;
	nome: string;
	foto?: string | null;
	tipoMaterial?: { nome: string } | null;
	unidadeMedida?: { nome: string } | null;
	valorUnitario: number;
	qtdSolicitada: number;
	qtdAtendida?: number | null;
}

interface MateriaisVisualizacaoProps {
	materiais: MaterialVisualizacao[];
	titulo?: string;
	mostrarValorTotal?: boolean;
	className?: string;
	solicitacaoStatus?: StatusSolicitacaoType;
	podeEditar?: boolean;
	isAprovador?: boolean; // Se é aprovador ou admin (sem restrições)
	onAtualizacao?: () => void;
}

export function MateriaisVisualizacao({
	materiais,
	titulo = "Materiais da Solicitação",
	mostrarValorTotal = true,
	className,
	solicitacaoStatus,
	podeEditar = false,
	isAprovador = false,
	onAtualizacao,
}: MateriaisVisualizacaoProps) {
	const [editandoItem, setEditandoItem] = useState<number | null>(null);
	const [novaQtd, setNovaQtd] = useState<number>(0);
	const [materialSelecionado, setMaterialSelecionado] =
		useState<MaterialVisualizacao | null>(null);
	const [modalAberto, setModalAberto] = useState(false);

	const podeEditarQtd =
		podeEditar &&
		solicitacaoStatus &&
		(solicitacaoStatus === STATUS_SOLICITACAO.PENDENTE ||
			solicitacaoStatus === STATUS_SOLICITACAO.APROVADA);

	const trpc = useTRPC();

	const atualizarQtdAprovadorMutation = useMutation(
		trpc.almoxarifado.solicitacoes.atualizarQtdAtendidaAprovador.mutationOptions(
			{
				onSuccess: () => {
					setEditandoItem(null);
					onAtualizacao?.();
				},
				onError: (error) => {
					console.error("Erro ao atualizar quantidade:", error);
				},
			},
		),
	);

	const atualizarQtdGerenteMutation = useMutation(
		trpc.almoxarifado.solicitacoes.atualizarQtdAtendidaGerente.mutationOptions({
			onSuccess: () => {
				setEditandoItem(null);
				onAtualizacao?.();
			},
			onError: (error) => {
				console.error("Erro ao atualizar quantidade:", error);
			},
		}),
	);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const calcularValorTotal = () => {
		return materiais.reduce((total, material) => {
			const qtd = material.qtdAtendida ?? material.qtdSolicitada;
			return total + material.valorUnitario * qtd;
		}, 0);
	};

	const calcularQuantidadeTotal = () => {
		return materiais.reduce((total, material) => {
			const qtd = material.qtdAtendida ?? material.qtdSolicitada;
			return total + qtd;
		}, 0);
	};

	const iniciarEdicao = (item: MaterialVisualizacao) => {
		if (!podeEditarQtd || !item.id) return;
		setEditandoItem(item.id);
		setNovaQtd(item.qtdAtendida ?? item.qtdSolicitada);
	};

	const cancelarEdicao = () => {
		setEditandoItem(null);
		setNovaQtd(0);
	};

	const salvarEdicao = async (itemId: number) => {
		if (novaQtd < 0) return;

		try {
			if (isAprovador) {
				// Aprovadores e admins podem altegar sem restrições
				await atualizarQtdAprovadorMutation.mutateAsync({
					itemId,
					qtdAtendida: novaQtd,
				});
			} else {
				// Gerentes só podem reduzir
				await atualizarQtdGerenteMutation.mutateAsync({
					itemId,
					qtdAtendida: novaQtd,
				});
			}
		} catch (error) {
			console.error("Erro ao salvar edição:", error);
		}
	};

	const abrirModal = (material: MaterialVisualizacao) => {
		setMaterialSelecionado(material);
		setModalAberto(true);
	};

	const fecharModal = () => {
		setModalAberto(false);
		setMaterialSelecionado(null);
	};

	if (materiais.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{titulo}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Nenhum material encontrado</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{titulo} ({materiais.length})
					</span>
					{mostrarValorTotal && (
						<div className="text-right">
							<p className="text-sm text-muted-foreground">Valor Total:</p>
							<p className="text-lg font-bold text-primary">
								{formatCurrency(calcularValorTotal())}
							</p>
						</div>
					)}
				</CardTitle>
				{!mostrarValorTotal && (
					<div className="flex gap-4 text-sm text-muted-foreground">
						<span>{calcularQuantidadeTotal()} unidades</span>
						<span>{formatCurrency(calcularValorTotal())}</span>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{materiais.map((material) => {
						const qtdAtual = material.qtdAtendida ?? material.qtdSolicitada;
						const estaEditando = editandoItem === material.id;

						return (
							<div
								key={material.materialId}
								className="flex items-center justify-between py-3 border-b border-border last:border-0"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<Thumbnail
										src={material.foto}
										alt={material.nome}
										size="small"
										fallbackIcon={Package}
										className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
										onClick={() => abrirModal(material)}
									/>
									<div className="min-w-0 flex-1">
										<p
											className="font-medium text-sm truncate"
											title={material.nome}
										>
											{material.nome}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant="outline" className="text-xs">
												{material.tipoMaterial?.nome || "Sem tipo"}
											</Badge>
											<span className="text-xs text-muted-foreground">
												{formatCurrency(material.valorUnitario)}/
												{material.unidadeMedida?.nome || "unid"}
											</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col items-end gap-1 flex-shrink-0">
									<div className="flex items-center gap-2">
										{estaEditando ? (
											<div className="flex items-center gap-1">
												<Input
													value={novaQtd}
													onChange={(e) =>
														setNovaQtd(Number.parseInt(e.target.value) || 0)
													}
													className="w-16 h-8 text-center text-sm"
													type="number"
													min="0"
													disabled={
														atualizarQtdAprovadorMutation.isPending ||
														atualizarQtdGerenteMutation.isPending
													}
												/>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => salvarEdicao(material.id || 0)}
													disabled={
														atualizarQtdAprovadorMutation.isPending ||
														atualizarQtdGerenteMutation.isPending
													}
													className="h-8 w-8 p-0"
												>
													<Check className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={cancelarEdicao}
													disabled={
														atualizarQtdAprovadorMutation.isPending ||
														atualizarQtdGerenteMutation.isPending
													}
													className="h-8 w-8 p-0"
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
										) : (
											<div className="flex items-center gap-2">
												<div className="text-right">
													<div className="flex items-center gap-1">
														<span className="text-sm font-medium">
															{qtdAtual}{" "}
															{material.unidadeMedida?.nome || "unid"}
														</span>
														{podeEditarQtd && material.id && (
															<Button
																size="sm"
																variant="ghost"
																onClick={() => iniciarEdicao(material)}
																className="h-6 w-6 p-0 ml-1"
															>
																<Edit className="h-3 w-3" />
															</Button>
														)}
													</div>
													{material.qtdAtendida !== undefined &&
														material.qtdAtendida !== material.qtdSolicitada && (
															<span className="text-xs text-muted-foreground">
																(Solicitado: {material.qtdSolicitada})
															</span>
														)}
												</div>
											</div>
										)}
									</div>
									<span className="font-mono text-sm font-bold text-primary">
										{formatCurrency(material.valorUnitario * qtdAtual)}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>

			{/* Modal de detalhes do material */}
			<Dialog open={modalAberto} onOpenChange={setModalAberto}>
				<DialogContent className="max-w-2xl">
					{materialSelecionado && (
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									{materialSelecionado.nome}
								</DialogTitle>
							</DialogHeader>

							<div className="space-y-6">
								{/* Imagem grande */}
								<div className="flex justify-center">
									<Thumbnail
										src={materialSelecionado.foto}
										alt={materialSelecionado.nome}
										size={200}
										fallbackIcon={Package}
										className="rounded-lg"
									/>
								</div>

								{/* Informações do material */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-3">
										<div>
											<h4 className="text-sm font-medium text-muted-foreground">
												Nome do Material
											</h4>
											<p className="font-medium">{materialSelecionado.nome}</p>
										</div>

										<div>
											<h4 className="text-sm font-medium text-muted-foreground">
												Tipo
											</h4>
											<Badge variant="outline">
												{materialSelecionado.tipoMaterial?.nome || "Sem tipo"}
											</Badge>
										</div>

										<div>
											<h4 className="text-sm font-medium text-muted-foreground">
												Valor Unitário
											</h4>
											<p className="font-medium text-primary">
												{formatCurrency(materialSelecionado.valorUnitario)}/
												{materialSelecionado.unidadeMedida?.nome || "unid"}
											</p>
										</div>
									</div>

									<div className="space-y-3">
										<div>
											<h4 className="text-sm font-medium text-muted-foreground">
												Quantidade Solicitada
											</h4>
											<p className="font-medium">
												{materialSelecionado.qtdSolicitada}{" "}
												{materialSelecionado.unidadeMedida?.nome || "unid"}
											</p>
										</div>

										{materialSelecionado.qtdAtendida !== undefined && (
											<div>
												<h4 className="text-sm font-medium text-muted-foreground">
													Quantidade Atendida
												</h4>
												<p className="font-medium">
													{materialSelecionado.qtdAtendida}{" "}
													{materialSelecionado.unidadeMedida?.nome || "unid"}
												</p>
											</div>
										)}

										<div>
											<h4 className="text-sm font-medium text-muted-foreground">
												Valor Total
											</h4>
											<p className="text-lg font-bold text-primary">
												{formatCurrency(
													materialSelecionado.valorUnitario *
														(materialSelecionado.qtdAtendida ??
															materialSelecionado.qtdSolicitada),
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</Card>
	);
}
