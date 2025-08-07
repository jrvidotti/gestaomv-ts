import {
	type MaterialSelecionado,
	MaterialSelector,
} from "@/components/almoxarifado/material-selector";
import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ALL_ROLES } from "@/constants";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema para o formulário local (sem transformações)
const formularioSolicitacaoSchema = z.object({
	unidadeId: z.string().min(1, "Unidade é obrigatória"),
	observacoes: z
		.string()
		.max(500, "Observações devem ter no máximo 500 caracteres")
		.optional(),
	materiais: z
		.array(z.any()) // MaterialSelecionado[]
		.min(1, "Deve haver pelo menos um material na solicitação")
		.max(50, "Máximo de 50 materiais por solicitação"),
});

type FormularioSolicitacaoData = z.infer<typeof formularioSolicitacaoSchema>;

export const Route = createFileRoute("/admin/almoxarifado/solicitacoes/nova")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [salvando, setSalvando] = useState(false);

	const trpc = useTRPC();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<FormularioSolicitacaoData>({
		resolver: zodResolver(formularioSolicitacaoSchema as any),
		defaultValues: {
			unidadeId: "",
			observacoes: "",
			materiais: [],
		},
	});

	const unidadeSelecionada = watch("unidadeId");
	const materiais = watch("materiais");

	// Buscar unidades
	const { data: unidades, isLoading: carregandoUnidades } = useQuery(
		trpc.unidades.listar.queryOptions(),
	);

	const { mutate: criarSolicitacao, error: erroMutacao } = useMutation({
		...trpc.almoxarifado.solicitacoes.criar.mutationOptions(),
		onSuccess: (data) => {
			// Redireciona para a página de visualização da solicitação criada
			navigate({
				to: "/admin/almoxarifado/solicitacoes/$id",
				params: { id: data.id.toString() },
			});
		},
		onError: () => {
			setSalvando(false);
		},
	});

	const onSubmit = async (data: FormularioSolicitacaoData) => {
		setSalvando(true);
		try {
			// Transformar os dados para o formato esperado pela API
			const dadosTransformados = {
				unidadeId: Number.parseInt(data.unidadeId, 10),
				observacoes: data.observacoes,
				itens: data.materiais.map((material: MaterialSelecionado) => ({
					materialId: material.materialId,
					qtdSolicitada: material.qtdSolicitada,
				})),
			};
			criarSolicitacao(dadosTransformados);
		} catch (error) {
			setSalvando(false);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const calcularValorTotal = () => {
		return materiais.reduce((total: number, material: MaterialSelecionado) => {
			return total + material.valorUnitario * material.qtdSolicitada;
		}, 0);
	};

	const handleMateriaisChange = (novosMateriais: MaterialSelecionado[]) => {
		setValue("materiais", novosMateriais);
	};

	const header = (
		<PageHeader
			title="Nova Solicitação"
			subtitle="Crie uma nova solicitação de materiais"
			actions={[
				<Link key="voltar" to="/admin/almoxarifado/solicitacoes">
					<Button variant="outline" disabled={salvando}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Button>
				</Link>,
				<Button
					key="criar"
					type="submit"
					form="form-solicitacao"
					disabled={salvando}
				>
					<Save className="h-4 w-4 mr-2" />
					{salvando ? "Criando..." : "Criar Solicitação"}
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				ALL_ROLES.ADMIN,
				ALL_ROLES.ALMOXARIFADO_GERENCIA,
				ALL_ROLES.ALMOXARIFADO_USUARIO,
			]}
		>
			<AdminLayout header={header}>
				<div>
					<form
						id="form-solicitacao"
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Informações Gerais */}
						<Card>
							<CardHeader>
								<CardTitle>Informações da Solicitação</CardTitle>
								<CardDescription>
									Defina a unidade de destino e observações da solicitação
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex gap-6">
									{/* Unidade */}
									<div className="space-y-2">
										<Label className="required">Unidade de Destino</Label>
										<Select
											value={unidadeSelecionada}
											onValueChange={(value) => setValue("unidadeId", value)}
										>
											<SelectTrigger
												className={cn("w-48", {
													"border-destructive": !!errors.unidadeId,
												})}
											>
												<SelectValue placeholder="Selecione a unidade" />
											</SelectTrigger>
											<SelectContent>
												{carregandoUnidades ? (
													<SelectItem value="loading" disabled>
														Carregando unidades...
													</SelectItem>
												) : unidades?.length ? (
													unidades.map((unidade) => (
														<SelectItem
															key={unidade.id}
															value={unidade.id.toString()}
														>
															{unidade.nome}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-units" disabled>
														Nenhuma unidade disponível
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										{errors.unidadeId && (
											<p className="text-sm text-destructive flex items-center gap-1">
												<AlertCircle className="h-4 w-4" />
												{errors.unidadeId.message}
											</p>
										)}
									</div>

									{/* Observações */}
									<div className="space-y-2 flex-1">
										<Label htmlFor="observacoes">Observações</Label>
										<Textarea
											id="observacoes"
											placeholder="Informações adicionais sobre a solicitação (opcional)"
											rows={3}
											{...register("observacoes")}
											className={errors.observacoes ? "border-destructive" : ""}
										/>
										{errors.observacoes && (
											<p className="text-sm text-destructive flex items-center gap-1">
												<AlertCircle className="h-4 w-4" />
												{errors.observacoes.message}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Materiais Solicitados */}
						<MaterialSelector
							materiais={materiais}
							onChange={handleMateriaisChange}
							disabled={salvando}
						/>

						{/* Resumo da Solicitação */}
						{materiais.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Resumo da Solicitação</CardTitle>
									<CardDescription>
										Confira os dados antes de finalizar
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-3">
										<div className="text-center p-4 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{materiais.length}
											</p>
											<p className="text-sm text-muted-foreground">
												{materiais.length === 1
													? "Material selecionado"
													: "Materiais selecionados"}
											</p>
										</div>
										<div className="text-center p-4 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{materiais.reduce(
													(total, m) => total + m.qtdSolicitada,
													0,
												)}
											</p>
											<p className="text-sm text-muted-foreground">
												Total de unidades
											</p>
										</div>
										<div className="text-center p-4 border rounded-lg">
											<p className="text-2xl font-bold text-primary">
												{formatCurrency(calcularValorTotal())}
											</p>
											<p className="text-sm text-muted-foreground">
												Valor total estimado
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Erro de validação de materiais */}
						{errors.materiais && (
							<Card>
								<CardContent className="pt-6">
									<p className="text-sm text-destructive flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.materiais.message}
									</p>
								</CardContent>
							</Card>
						)}

						{/* Erro da mutação */}
						{erroMutacao && (
							<Card>
								<CardContent className="pt-6">
									<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
										<p className="text-sm text-destructive flex items-center gap-2">
											<AlertCircle className="h-4 w-4" />
											Erro ao criar solicitação: {erroMutacao.message}
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</form>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
