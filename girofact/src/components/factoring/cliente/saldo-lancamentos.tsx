import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	AlertCircle,
	ArrowUpDown,
	DollarSign,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

interface SaldoLancamento {
	entradas: {
		valor: number;
		count: number;
	};
	saidas: {
		valor: number;
		count: number;
	};
	saldoAtual: number;
	lancamentosRecentes: {
		id: number;
		dataLancamento: string;
		valorLancamento: number;
		tipoLancamento: "entrada" | "saida";
		descricao: string;
	}[];
}

interface SaldoLancamentosProps {
	saldo: SaldoLancamento;
	isLoading?: boolean;
}

export function SaldoLancamentos({ saldo, isLoading }: SaldoLancamentosProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const totalMovimentacao = saldo.entradas.valor + saldo.saidas.valor;
	const percentualEntradas =
		totalMovimentacao > 0
			? (saldo.entradas.valor / totalMovimentacao) * 100
			: 0;

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Saldo de Lançamentos
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-16 bg-muted animate-pulse rounded" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="h-5 w-5" />
					Saldo de Lançamentos
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Saldo Atual */}
				<div className="text-center p-6 bg-muted/50 rounded-lg">
					<div className="text-sm text-muted-foreground mb-1">Saldo Atual</div>
					<div
						className={`text-3xl font-bold ${saldo.saldoAtual >= 0 ? "text-green-600" : "text-red-600"}`}
					>
						{formatCurrency(saldo.saldoAtual)}
					</div>

					{saldo.saldoAtual < 0 && (
						<div className="flex items-center justify-center gap-2 mt-2 text-red-600">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">Saldo negativo</span>
						</div>
					)}
				</div>

				{/* Resumo de Entradas e Saídas */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Entradas */}
					<div className="p-4 border rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-green-600" />
								<span className="text-sm font-medium">Entradas</span>
							</div>
							<Badge variant="outline" className="text-green-600">
								{saldo.entradas.count}
							</Badge>
						</div>

						<div className="text-xl font-bold text-green-600 mb-2">
							{formatCurrency(saldo.entradas.valor)}
						</div>

						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{percentualEntradas.toFixed(1)}% do total</span>
							</div>
							<Progress value={percentualEntradas} className="h-2 bg-red-100" />
						</div>
					</div>

					{/* Saídas */}
					<div className="p-4 border rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<TrendingDown className="h-4 w-4 text-red-600" />
								<span className="text-sm font-medium">Saídas</span>
							</div>
							<Badge variant="outline" className="text-red-600">
								{saldo.saidas.count}
							</Badge>
						</div>

						<div className="text-xl font-bold text-red-600 mb-2">
							{formatCurrency(saldo.saidas.valor)}
						</div>

						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{(100 - percentualEntradas).toFixed(1)}% do total</span>
							</div>
							<Progress
								value={100 - percentualEntradas}
								className="h-2 bg-green-100"
							/>
						</div>
					</div>
				</div>

				{/* Lançamentos Recentes */}
				{saldo.lancamentosRecentes.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<ArrowUpDown className="h-4 w-4" />
							<h4 className="font-medium">Últimos Lançamentos</h4>
						</div>

						<div className="space-y-2">
							{saldo.lancamentosRecentes.slice(0, 5).map((lancamento) => (
								<div
									key={lancamento.id}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div className="flex items-center gap-3">
										{lancamento.tipoLancamento === "entrada" ? (
											<TrendingUp className="h-4 w-4 text-green-600" />
										) : (
											<TrendingDown className="h-4 w-4 text-red-600" />
										)}

										<div>
											<div className="text-sm font-medium">
												{lancamento.descricao ||
													(lancamento.tipoLancamento === "entrada"
														? "Entrada"
														: "Saída")}
											</div>
											<div className="text-xs text-muted-foreground">
												{formatDate(lancamento.dataLancamento)}
											</div>
										</div>
									</div>

									<div
										className={`font-semibold ${
											lancamento.tipoLancamento === "entrada"
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{lancamento.tipoLancamento === "entrada" ? "+" : "-"}
										{formatCurrency(Math.abs(lancamento.valorLancamento))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Estatística Resumida */}
				<div className="p-4 bg-muted/30 rounded-lg">
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<div className="text-sm text-muted-foreground">
								Total Movimentado
							</div>
							<div className="font-semibold">
								{formatCurrency(totalMovimentacao)}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Lançamentos</div>
							<div className="font-semibold">
								{saldo.entradas.count + saldo.saidas.count}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Giro</div>
							<div className="font-semibold">
								{saldo.saidas.count > 0
									? `${(saldo.entradas.valor / saldo.saidas.valor).toFixed(2)}x`
									: "-"}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
