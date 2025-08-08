import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { PessoaForm } from "@/components/factoring/forms/pessoa-form";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/pessoas/$id/editar")({
  component: EditarPessoaPage,
});

function EditarPessoaPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const trpc = useTRPC();

  // Buscar dados da pessoa
  const {
    data: pessoa,
    isLoading: isLoadingPessoa,
    refetch,
  } = useQuery(
    trpc.factoring.pessoas.buscar.queryOptions({
      id: parseInt(id),
    }),
  );

  // Atualizar pessoa
  const { mutate: updatePessoa, isPending } = useMutation({
    ...trpc.factoring.pessoas.atualizar.mutationOptions(),
    onSuccess: () => {
      toast.success("Pessoa atualizada com sucesso!");
      navigate({
        to: "/admin/factoring/pessoas/$id",
        params: { id },
      });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar pessoa: ${error.message}`);
    },
  });

  // Buscar dados por documento (API Direct Data)
  const { mutate: buscarPorDocumento } = useMutation({
    ...trpc.factoring.pessoas.buscarPorDocumento.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Dados encontrados! Preenchendo formulário...");
      // Aqui você pode preencher o formulário com os dados retornados
    },
    onError: (error) => {
      toast.error(`Erro ao buscar documento: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    // Ajustar dados antes de enviar
    const submitData = {
      id: parseInt(id),
      ...data,
      dataNascimentoFundacao: data.dataNascimentoFundacao 
        ? new Date(data.dataNascimentoFundacao) 
        : undefined,
    };
    updatePessoa(submitData);
  };

  const handleCancel = () => {
    navigate({
      to: "/admin/factoring/pessoas/$id",
      params: { id },
    });
  };

  const handleBuscarDocumento = (documento: string) => {
    buscarPorDocumento({ documento });
  };

  const header = (
    <PageHeader
      title="Editar Pessoa"
      subtitle={pessoa ? `Editando ${pessoa.nomeRazaoSocial}` : "Carregando..."}
      icon={<Users className="h-5 w-5" />}
      actions={[
        <Button key="back" asChild variant="outline">
          <Link to="/admin/factoring/pessoas/$id" params={{ id }}>
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
                <Link to="/admin/factoring/pessoas">Voltar à lista</Link>
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
    dataNascimentoFundacao: pessoa.dataNascimentoFundacao || "",
    inscricaoEstadual: pessoa.inscricaoEstadual || "",
    inscricaoMunicipal: pessoa.inscricaoMunicipal || "",
    nomeMae: pessoa.nomeMae || "",
    sexo: pessoa.sexo || "",
    email: pessoa.email || "",
    observacoes: pessoa.observacoes || "",
    cep: pessoa.cep || "",
    logradouro: pessoa.logradouro || "",
    numero: pessoa.numero || "",
    complemento: pessoa.complemento || "",
    bairro: pessoa.bairro || "",
    cidade: pessoa.cidade || "",
    estado: pessoa.estado || "",
  };

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="max-w-4xl mx-auto">
          <PessoaForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onBuscarDocumento={handleBuscarDocumento}
            isLoading={isPending}
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}