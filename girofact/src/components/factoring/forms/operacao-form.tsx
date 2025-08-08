import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const operacaoFormSchema = z.object({
	clienteId: z.number().min(1, "Cliente é obrigatório"),
	carteiraId: z.number().min(1, "Carteira é obrigatória"),
	taxaJuros: z
		.number()
		.min(0.01, "Taxa de juros deve ser maior que 0")
		.max(100, "Taxa não pode ser maior que 100%"),
	valorLiquido: z
		.number()
		.min(0.01, "Valor líquido deve ser maior que 0")
		.optional(),
	dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"),
	observacoes: z.string().optional(),
});

type OperacaoFormData = z.infer<typeof operacaoFormSchema>;

interface OperacaoFormProps {
	initialData?: Partial<
		OperacaoFormData & {
			uid: string;
			status: string;
		}
	>;
	onSubmit: (data: OperacaoFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
	onCalcular?: (taxaJuros: number, valorBruto: number) => void;
}

export function OperacaoForm({
	initialData,
	onSubmit,
	onCancel,
	isLoading,
	mode,
	onCalcular,
}: OperacaoFormProps) {
	const trpc = useTRPC();

	// Buscar carteiras disponíveis
	const { data: carteiras } = useQuery(
		trpc.factoring.carteiras.listar.queryOptions(),
	);

	// Buscar clientes disponíveis
	const { data: clientes } = useQuery(
		trpc.factoring.clientes.listar.queryOptions(),
	);

	const form = useForm<OperacaoFormData>({
		resolver: zodResolver(operacaoFormSchema),
		defaultValues: {
			clienteId: initialData?.clienteId || 0,
			carteiraId: initialData?.carteiraId || 0,
			taxaJuros: initialData?.taxaJuros || 0,
			valorLiquido: initialData?.valorLiquido || undefined,
			dataVencimento: initialData?.dataVencimento || "",
			observacoes: initialData?.observacoes || "",
		},
	});

	const isReadOnly = mode === "edit" && initialData?.status !== "rascunho";

	const handleSubmit = (data: OperacaoFormData) => {
		onSubmit(data);
	};

	const handleCalcular = () => {
		const taxaJuros = form.getValues("taxaJuros");
		const valorLiquido = form.getValues("valorLiquido");
		if (taxaJuros && valorLiquido && onCalcular) {
			onCalcular(taxaJuros, valorLiquido);
		}
	};

	const clienteSelecionado = clientes?.find(
		(c) => c.id === form.watch("clienteId"),
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{mode === "create" ? "Nova Operação" : "Editar Operação"}
						{initialData?.status && mode === "edit" && (
							<Badge
								variant={
									initialData.status === "rascunho"
										? "secondary"
										: initialData.status === "aprovacao"
											? "outline"
											: initialData.status === "efetivada"
												? "default"
												: initialData.status === "liquidada"
													? "default"
													: "destructive"
								}
							>
								{initialData.status === "rascunho" && "Rascunho"}
								{initialData.status === "aprovacao" && "Em Aprovação"}
								{initialData.status === "efetivada" && "Efetivada"}
								{initialData.status === "liquidada" && "Liquidada"}
								{initialData.status === "cancelada" && "Cancelada"}
							</Badge>
						)}
					</CardTitle>
					{initialData?.uid && (
						<div className="text-sm text-muted-foreground">
							Protocolo: <span className="font-mono">{initialData.uid}</span>
						</div>
					)}
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							{/* Dados Básicos */}
							<div className="space-y-4">
								<h3 className="font-medium text-lg">Dados da Operação</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="clienteId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Cliente</FormLabel>
												<Select
													onValueChange={(value) =>
														field.onChange(Number.parseInt(value))
													}
													value={field.value ? field.value.toString() : ""}
													disabled={isReadOnly}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecione o cliente" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{clientes?.map((cliente) => (
															<SelectItem
																key={cliente.id}
																value={cliente.id.toString()}
															>
																<div className="flex items-center gap-2">
																	<Users className="h-4 w-4" />
																	<div>
																		<div className="font-medium">
																			{cliente.pessoa.nomeRazaoSocial}
																		</div>
																		<div className="text-sm text-muted-foreground font-mono">
																			{cliente.pessoa.documento}
																		</div>
																	</div>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="carteiraId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Carteira</FormLabel>
												<Select
													onValueChange={(value) =>
														field.onChange(Number.parseInt(value))
													}
													value={field.value ? field.value.toString() : ""}
													disabled={isReadOnly}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecione a carteira" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{carteiras?.map((carteira) => (
															<SelectItem
																key={carteira.id}
																value={carteira.id.toString()}
															>
																<div>
																	<div className="font-medium">
																		{carteira.nome}
																	</div>
																	<div className="text-sm text-muted-foreground">
																		{carteira.banco} - Ag: {carteira.agencia}
																	</div>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{clienteSelecionado && (
									<div className="p-4 bg-muted rounded-lg">
										<h4 className="font-medium mb-2">Informações do Cliente</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
											<div>
												<span className="text-muted-foreground">
													Nome/Razão:
												</span>
												<span className="ml-2">
													{clienteSelecionado.pessoa.nomeRazaoSocial}
												</span>
											</div>
											<div>
												<span className="text-muted-foreground">
													Documento:
												</span>
												<span className="ml-2 font-mono">
													{clienteSelecionado.pessoa.documento}
												</span>
											</div>
											{clienteSelecionado.pessoa.email && (
												<div>
													<span className="text-muted-foreground">E-mail:</span>
													<span className="ml-2">
														{clienteSelecionado.pessoa.email}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="dataVencimento"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Data de Vencimento</FormLabel>
												<FormControl>
													<Input {...field} type="date" disabled={isReadOnly} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex gap-2">
										<FormField
											control={form.control}
											name="taxaJuros"
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormLabel>Taxa de Juros (%)</FormLabel>
													<FormControl>
														<Input
															{...field}
															type="number"
															step="0.01"
															min="0"
															max="100"
															placeholder="2.50"
															onChange={(e) =>
																field.onChange(
																	Number.parseFloat(e.target.value) || 0,
																)
															}
															disabled={isReadOnly}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										{onCalcular && !isReadOnly && (
											<Button
												type="button"
												variant="outline"
												onClick={handleCalcular}
												className="mt-8"
											>
												<Calculator className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>

								<FormField
									control={form.control}
									name="valorLiquido"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Valor Líquido (R$)</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													step="0.01"
													min="0"
													placeholder="1000.00"
													onChange={(e) =>
														field.onChange(
															Number.parseFloat(e.target.value) || undefined,
														)
													}
													value={field.value || ""}
													disabled={isReadOnly}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Observações */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="observacoes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Observações</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													rows={3}
													placeholder="Observações adicionais sobre a operação..."
													disabled={isReadOnly}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{!isReadOnly && (
								<div className="flex justify-end gap-4 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={onCancel}
										disabled={isLoading}
									>
										Cancelar
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading
											? "Salvando..."
											: mode === "create"
												? "Criar"
												: "Salvar"}
									</Button>
								</div>
							)}

							{isReadOnly && (
								<div className="flex justify-end pt-4">
									<Button type="button" variant="outline" onClick={onCancel}>
										Voltar
									</Button>
								</div>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
