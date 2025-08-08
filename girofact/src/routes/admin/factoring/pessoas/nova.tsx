import { RouteGuard } from "@/components/auth/route-guard";
import { PessoaForm } from "@/components/factoring/forms/pessoa-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/pessoas/nova")({
	component: NovaPessoaPage,
});

function NovaPessoaPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	// Criar pessoa
	const { mutate: createPessoa, isPending } = useMutation({
		...trpc.factoring.pessoas.create.mutationOptions(),
		onSuccess: (data) => {
			toast.success("Pessoa criada com sucesso!");
			navigate({
				to: "/admin/factoring/pessoas/$id",
				params: { id: data.id.toString() },
			});
		},
		onError: (error) => {
			toast.error(`Erro ao criar pessoa: ${error.message}`);
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
				} else if (resultado.fonte === "cache" && resultado.dados) {
					toast.success(
						"Dados encontrados no cache! Preenchendo formulário...",
					);
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
			dataNascimentoFundacao: data.dataNascimentoFundacao
				? new Date(data.dataNascimentoFundacao)
				: undefined,
			telefones: telefones.filter((tel: any) => !tel.isNew || tel.numero), // Remove telefones vazios
			dadosBancarios: dadosBancarios.filter(
				(db: any) => !db.isNew || (db.banco && db.agencia && db.conta),
			), // Remove dados bancários vazios
		};
		createPessoa(submitData);
	};

	const handleCancel = () => {
		navigate({
			to: "/admin/factoring/pessoas",
		});
	};

	const handleBuscarDocumento = (
		documento: string,
		onSuccess?: (dados: any) => void,
	) => {
		buscarPorDocumento(
			{ documento },
			{
				onSuccess: (resultado: any) => {
					if (
						(resultado.fonte === "api_direct_data" ||
							resultado.fonte === "cache") &&
						resultado.dados &&
						onSuccess
					) {
						// Chamar callback para preencher formulário
						onSuccess(resultado.dados);
					}
				},
			},
		);
	};

	const header = (
		<PageHeader
			title="Nova Pessoa"
			subtitle="Cadastrar nova pessoa física ou jurídica"
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="back" asChild variant="outline">
					<Link to="/admin/factoring/pessoas">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Link>
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto">
					<PessoaForm
						mode="create"
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
