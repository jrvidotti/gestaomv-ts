import { RouteGuard } from "@/components/auth/route-guard";
import { PessoaForm } from "@/components/factoring/forms/pessoa-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

interface RouteSearch {
	from?: "cliente";
	clienteId?: string;
}

export const Route = createFileRoute("/admin/factoring/pessoas/$id/editar")({
	component: EditarPessoaPage,
	validateSearch: (search: Record<string, unknown>): RouteSearch => ({
		from: search.from === "cliente" ? "cliente" : undefined,
		clienteId:
			typeof search.clienteId === "string" ? search.clienteId : undefined,
	}),
});

function EditarPessoaPage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { from, clienteId } = Route.useSearch();
	const trpc = useTRPC();

	// Buscar dados da pessoa
	const { data: pessoa, isLoading: isLoadingPessoa } = useQuery(
		trpc.factoring.pessoas.findById.queryOptions({
			id: Number.parseInt(id),
		}),
	);

	// Atualizar pessoa
	const { mutate: updatePessoa, isPending } = useMutation({
		...trpc.factoring.pessoas.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Pessoa atualizada com sucesso!");
			if (from === "cliente" && clienteId) {
				navigate({
					to: "/admin/factoring/clientes/$id",
					params: { id: clienteId },
				});
			} else {
				navigate({
					to: "/admin/factoring/pessoas/$id",
					params: { id },
				});
			}
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar pessoa: ${error.message}`);
		},
	});

	// Buscar dados por documento (API Direct Data)
	const { mutate: buscarPorDocumento, isPending: isLoadingBusca } = useMutation(
		{
			...trpc.factoring.pessoas.buscarPorCpfCnpj.mutationOptions(),
			onSuccess: (resultado: any) => {
				if (resultado.fonte === "banco_local") {
					toast.info("Pessoa já cadastrada no sistema");
				} else if (resultado.fonte === "api_direct_data" && resultado.dados) {
					toast.success("Dados encontrados! Preenchendo formulário...");
					// Os dados serão preenchidos via callback no componente PessoaForm
				} else if (resultado.fonte === "nao_encontrado") {
					toast.warning(resultado.mensagem || "Dados não encontrados");
				} else if (resultado.fonte === "erro") {
					toast.error(resultado.mensagem || "Erro ao buscar dados");
				}
			},
			onError: (error) => {
				toast.error(`Erro ao buscar documento: ${error.message}`);
			},
		},
	);

	const handleSubmit = (data: any, telefones: any, dadosBancarios: any) => {
		// Ajustar dados antes de enviar
		const submitData = {
			...data,
			id: Number.parseInt(id),
			dataNascimentoFundacao:
				data.dataNascimentoFundacao && data.dataNascimentoFundacao !== ""
					? new Date(data.dataNascimentoFundacao)
					: undefined,
			telefones: telefones.map((tel: any) => ({
				...tel,
				id: tel.isNew ? undefined : tel.id, // Remove ID temporário para novos
			})),
			dadosBancarios: dadosBancarios.map((db: any) => ({
				...db,
				id: db.isNew ? undefined : db.id, // Remove ID temporário para novos
			})),
		};
		updatePessoa(submitData);
	};

	const handleCancel = () => {
		if (from === "cliente" && clienteId) {
			navigate({
				to: "/admin/factoring/clientes/$id",
				params: { id: clienteId },
			});
		} else {
			navigate({
				to: "/admin/factoring/pessoas/$id",
				params: { id },
			});
		}
	};

	const handleBuscarDocumento = (
		documento: string,
		onSuccess?: (dados: any) => void,
	) => {
		if (documento) {
			buscarPorDocumento(
				{ documento },
				{
					onSuccess: (resultado: any) => {
						if (
							resultado.fonte === "api_direct_data" &&
							resultado.dados &&
							onSuccess
						) {
							// Chamar callback para preencher formulário
							onSuccess(resultado.dados);
						}
					},
				},
			);
		}
	};

	const header = (
		<PageHeader
			title="Editar Pessoa"
			subtitle={pessoa ? `Editando ${pessoa.nomeRazaoSocial}` : "Carregando..."}
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="back" asChild variant="outline">
					<Link
						to={
							from === "cliente" && clienteId
								? "/admin/factoring/clientes/$id"
								: "/admin/factoring/pessoas/$id"
						}
						params={{ id: from === "cliente" && clienteId ? clienteId : id }}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Link>
				</Button>,
			]}
		/>
	);

	if (isLoadingPessoa) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="h-32 bg-muted animate-pulse rounded" />
							))}
						</div>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (!pessoa) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium">Pessoa não encontrada</h3>
							<p className="text-muted-foreground mb-4">
								A pessoa que você está procurando não existe.
							</p>
							<Button asChild>
								<Link
									to={
										from === "cliente" && clienteId
											? "/admin/factoring/clientes/$id"
											: "/admin/factoring/pessoas"
									}
									params={
										from === "cliente" && clienteId
											? { id: clienteId }
											: undefined
									}
								>
									Voltar
								</Link>
							</Button>
						</div>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	// Preparar dados iniciais para o formulário
	const initialData = {
		tipoPessoa: pessoa.tipoPessoa,
		documento: pessoa.documento,
		nomeRazaoSocial: pessoa.nomeRazaoSocial,
		nomeFantasia: pessoa.nomeFantasia || "",
		dataNascimentoFundacao: pessoa.dataNascimentoFundacao
			? pessoa.dataNascimentoFundacao instanceof Date
				? pessoa.dataNascimentoFundacao.toISOString().split("T")[0]
				: pessoa.dataNascimentoFundacao
			: "",
		inscricaoEstadual: pessoa.inscricaoEstadual || "",
		inscricaoMunicipal: pessoa.inscricaoMunicipal || "",
		nomeMae: pessoa.nomeMae || "",
		sexo: pessoa.sexo || ("nao_informado" as const),
		email: pessoa.email || "",
		observacoesGerais: pessoa.observacoesGerais || "",
		cep: pessoa.cep || "",
		logradouro: pessoa.logradouro || "",
		numero: pessoa.numero || "",
		complemento: pessoa.complemento || "",
		bairro: pessoa.bairro || "",
		cidade: pessoa.cidade || "",
		estado: pessoa.estado || "",
	};

	// Preparar dados iniciais de telefones e dados bancários
	const initialTelefones =
		pessoa.telefones?.map((tel: any) => ({
			...tel,
			isEditing: false,
			isNew: false,
		})) || [];

	const initialDadosBancarios =
		pessoa.dadosBancarios?.map((db: any) => ({
			...db,
			isEditing: false,
			isNew: false,
		})) || [];

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto">
					<PessoaForm
						mode="edit"
						initialData={initialData}
						initialTelefones={initialTelefones}
						initialDadosBancarios={initialDadosBancarios}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						onBuscarDocumento={handleBuscarDocumento}
						isLoading={isPending}
						isLoadingBusca={isLoadingBusca}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
