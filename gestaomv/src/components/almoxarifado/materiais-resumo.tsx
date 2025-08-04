"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { Package } from "lucide-react";

export interface MaterialResumo {
	materialId: number;
	nome: string;
	foto?: string | null;
	tipoMaterial?: { nome: string } | null;
	unidadeMedida?: { nome: string } | null;
	valorUnitario: number;
	qtdSolicitada: number;
}

interface MateriaisResumoProps {
	materiais: MaterialResumo[];
	titulo?: string;
	mostrarValorTotal?: boolean;
	className?: string;
}

export function MateriaisResumo({
	materiais,
	titulo = "Materiais Selecionados",
	mostrarValorTotal = true,
	className,
}: MateriaisResumoProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const calcularValorTotal = () => {
		return materiais.reduce((total, material) => {
			return total + material.valorUnitario * material.qtdSolicitada;
		}, 0);
	};

	const calcularQuantidadeTotal = () => {
		return materiais.reduce((total, material) => {
			return total + material.qtdSolicitada;
		}, 0);
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
						<p className="text-muted-foreground">Nenhum material selecionado</p>
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
					{materiais.map((material) => (
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
									className="flex-shrink-0"
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
											{material.unidadeMedida?.nome}
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end gap-1 flex-shrink-0">
								<span className="text-sm font-medium">
									{material.qtdSolicitada} {material.unidadeMedida?.nome}
								</span>
								<span className="font-mono text-sm font-bold text-primary">
									{formatCurrency(
										material.valorUnitario * material.qtdSolicitada,
									)}
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
