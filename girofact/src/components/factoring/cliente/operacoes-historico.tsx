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
import { Link } from "@tanstack/react-router";
import { ExternalLink, Eye, TrendingUp } from "lucide-react";

interface Operacao {
	id: number;
	uid: string;
	valorLiquido: number;
	taxaJuros: number;
	status: string;
	dataAprovacao: string | null;
	dataPagamento: string | null;
	criadoEm: string;
	carteira?: {
		nome: string;
	};
	_count?: {
		documentos: number;
	};
}

interface OperacoesHistoricoProps {
	operacoes: Operacao[];
	isLoading?: boolean;
}

export function OperacoesHistorico({
	operacoes,
	isLoading,
}: OperacoesHistoricoProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("pt-BR");
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			rascunho: "outline",
			aprovacao: "secondary",
			efetivada: "default",
			liquidada: "default",
			cancelada: "destructive",
		} as const;

		const labels = {
			rascunho: "Rascunho",
			aprovacao: "Em Aprovação",
			efetivada: "Efetivada",
			liquidada: "Liquidada",
			cancelada: "Cancelada",
		} as const;

		return (
			<Badge variant={variants[status as keyof typeof variants] || "secondary"}>
				{labels[status as keyof typeof labels] || status}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Últimas Operações
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="h-16 bg-muted animate-pulse rounded" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (operacoes.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Últimas Operações
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						<TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Nenhuma operação encontrada</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Últimas Operações
					</CardTitle>
					<Button variant="outline" size="sm" asChild>
						<Link
							to="/admin/factoring/operacoes"
							search={{ cliente: operacoes[0]?.id }}
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							Ver todas
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Código</TableHead>
								<TableHead>Valor Líquido</TableHead>
								<TableHead>Taxa</TableHead>
								<TableHead>Documentos</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Data</TableHead>
								<TableHead>Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{operacoes.map((operacao) => (
								<TableRow key={operacao.id}>
									<TableCell>
										<div className="font-mono text-sm">{operacao.uid}</div>
									</TableCell>

									<TableCell>
										<div className="font-semibold">
											{formatCurrency(operacao.valorLiquido)}
										</div>
									</TableCell>

									<TableCell>
										<div className="font-mono">{operacao.taxaJuros}% a.m.</div>
									</TableCell>

									<TableCell>
										<Badge variant="outline">
											{operacao._count?.documentos || 0}
										</Badge>
									</TableCell>

									<TableCell>{getStatusBadge(operacao.status)}</TableCell>

									<TableCell>
										<div className="text-sm">
											{operacao.status === "efetivada" ||
											operacao.status === "liquidada"
												? formatDate(operacao.dataAprovacao)
												: formatDate(operacao.criadoEm)}
										</div>
										{operacao.carteira && (
											<div className="text-xs text-muted-foreground">
												{operacao.carteira.nome}
											</div>
										)}
									</TableCell>

									<TableCell>
										<Button variant="ghost" size="sm" asChild>
											<Link
												to="/admin/factoring/operacoes/$uid"
												params={{ uid: operacao.uid }}
											>
												<Eye className="h-4 w-4" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
