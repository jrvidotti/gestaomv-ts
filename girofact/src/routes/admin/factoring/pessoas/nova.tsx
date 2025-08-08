import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { PessoaForm } from "@/components/factoring/forms/pessoa-form";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

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
  const { mutate: buscarPorDocumento } = useMutation({
    ...trpc.factoring.pessoas.buscarPorCpfCnpj.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Dados encontrados! Preenchendo formulário...");
      // Aqui você pode preencher o formulário com os dados retornados
    },
    onError: (error) => {
      toast.error(`Erro ao buscar documento: ${error.message}`);
    },
  });

  const handleSubmit = (data: any, telefones: any, dadosBancarios: any) => {
    // Ajustar dados antes de enviar
    const submitData = {
      ...data,
      dataNascimentoFundacao: data.dataNascimentoFundacao 
        ? new Date(data.dataNascimentoFundacao) 
        : undefined,
      telefones: telefones.filter((tel: any) => !tel.isNew || tel.numero), // Remove telefones vazios
      dadosBancarios: dadosBancarios.filter((db: any) => !db.isNew || (db.banco && db.agencia && db.conta)), // Remove dados bancários vazios
    };
    createPessoa(submitData);
  };

  const handleCancel = () => {
    navigate({
      to: "/admin/factoring/pessoas",
    });
  };

  const handleBuscarDocumento = (documento: string) => {
    buscarPorDocumento({ documento });
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
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}