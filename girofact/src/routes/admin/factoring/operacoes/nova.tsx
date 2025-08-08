import { RouteGuard } from "@/components/auth/route-guard";
import { OperacaoForm } from "@/components/factoring/forms/operacao-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/operacoes/nova")({
	component: NovaOperacaoPage,
});

function NovaOperacaoPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	// Criar operação
	const { mutate: createOperacao, isPending } = useMutation({
		...trpc.factoring.operacoes.upsertOperacao.mutationOptions(),
		onSuccess: (data) => {
			toast.success("Operação criada com sucesso!");
			navigate({
				to: "/admin/factoring/operacoes/$uid",
				params: { uid: data.uid },
			});
		},
		onError: (error) => {
			toast.error(`Erro ao criar operação: ${error.message}`);
		},
	});

	// TODO: Implementar método de cálculo no router
	// const { mutate: calcularOperacao } = useMutation({
	//   ...trpc.factoring.operacoes.calcular.mutationOptions(),
	//   onSuccess: (data) => {
	//     toast.success(`Valor calculado: R$ ${data.valorLiquido.toFixed(2)}`);
	//   },
	//   onError: (error) => {
	//     toast.error(`Erro no cálculo: ${error.message}`);
	//   },
	// });

	const handleSubmit = (data: any) => {
		// Ajustar dados antes de enviar
		const submitData = {
			...data,
			dataVencimento: data.dataVencimento
				? new Date(data.dataVencimento)
				: undefined,
		};
		createOperacao(submitData);
	};

	const handleCancel = () => {
		navigate({
			to: "/admin/factoring/operacoes",
		});
	};

	const handleCalcular = (taxaJuros: number, valorBruto: number) => {
		calcularOperacao({
			taxaJuros,
			valorBruto,
		});
	};

	const header = (
		<PageHeader
			title="Nova Operação"
			subtitle="Criar nova operação de factoring"
			icon={<FileText className="h-5 w-5" />}
			actions={[
				<Button key="back" asChild variant="outline">
					<Link to="/admin/factoring/operacoes">
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
					<OperacaoForm
						mode="create"
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						onCalcular={handleCalcular}
						isLoading={isPending}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
