import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Edit, ArrowLeft, Mail, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/factoring/pessoas/$id")({
  component: PessoaDetailsPage,
});

function PessoaDetailsPage() {
  const { id } = Route.useParams();
  const trpc = useTRPC();

  // Buscar dados da pessoa
  const {
    data: pessoa,
    isLoading,
    error,
  } = useQuery(
    trpc.factoring.pessoas.buscar.queryOptions({
      id: parseInt(id),
    }),
  );

  const formatDocument = (documento: string, tipo: "fisica" | "juridica") => {
    if (tipo === "fisica") {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const header = (
    <PageHeader
      title="Detalhes da Pessoa"
      subtitle={pessoa ? pessoa.nomeRazaoSocial : "Carregando..."}
      icon={<Users className="h-5 w-5" />}
      actions={[
        <Button key="back" asChild variant="outline">
          <Link to="/admin/factoring/pessoas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>,
        ...(pessoa ? [
          <Button key="edit" asChild>
            <Link to="/admin/factoring/pessoas/$id/editar" params={{ id }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        ] : []),
      ]}
    />
  );

  if (isLoading) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-4xl mx-auto space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  if (error || !pessoa) {
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

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Pessoa
                  </label>
                  <div className="mt-1">
                    <Badge variant={pessoa.tipoPessoa === "fisica" ? "default" : "secondary"}>
                      {pessoa.tipoPessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {pessoa.tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
                  </label>
                  <div className="mt-1 font-mono">
                    {formatDocument(pessoa.documento, pessoa.tipoPessoa)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {pessoa.tipoPessoa === "fisica" ? "Nome Completo" : "Razão Social"}
                </label>
                <div className="mt-1 font-medium text-lg">
                  {pessoa.nomeRazaoSocial}
                </div>
              </div>

              {pessoa.nomeFantasia && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome Fantasia
                  </label>
                  <div className="mt-1">
                    {pessoa.nomeFantasia}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pessoa.dataNascimentoFundacao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {pessoa.tipoPessoa === "fisica" ? "Data de Nascimento" : "Data de Fundação"}
                    </label>
                    <div className="mt-1">
                      {formatDate(pessoa.dataNascimentoFundacao)}
                    </div>
                  </div>
                )}

                {pessoa.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <Mail className="h-4 w-4 inline mr-1" />
                      E-mail
                    </label>
                    <div className="mt-1">
                      <a 
                        href={`mailto:${pessoa.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {pessoa.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Campos específicos para PF */}
              {pessoa.tipoPessoa === "fisica" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pessoa.nomeMae && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nome da Mãe
                      </label>
                      <div className="mt-1">
                        {pessoa.nomeMae}
                      </div>
                    </div>
                  )}

                  {pessoa.sexo && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Sexo
                      </label>
                      <div className="mt-1">
                        {pessoa.sexo === "M" ? "Masculino" : "Feminino"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Campos específicos para PJ */}
              {pessoa.tipoPessoa === "juridica" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pessoa.inscricaoEstadual && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Inscrição Estadual
                      </label>
                      <div className="mt-1 font-mono">
                        {pessoa.inscricaoEstadual}
                      </div>
                    </div>
                  )}

                  {pessoa.inscricaoMunicipal && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Inscrição Municipal
                      </label>
                      <div className="mt-1 font-mono">
                        {pessoa.inscricaoMunicipal}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          {(pessoa.cep || pessoa.logradouro) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pessoa.cep && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      CEP
                    </label>
                    <div className="mt-1 font-mono">
                      {pessoa.cep}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pessoa.logradouro && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Logradouro
                      </label>
                      <div className="mt-1">
                        {pessoa.logradouro}
                      </div>
                    </div>
                  )}

                  {pessoa.numero && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Número
                      </label>
                      <div className="mt-1">
                        {pessoa.numero}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pessoa.complemento && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Complemento
                      </label>
                      <div className="mt-1">
                        {pessoa.complemento}
                      </div>
                    </div>
                  )}

                  {pessoa.bairro && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Bairro
                      </label>
                      <div className="mt-1">
                        {pessoa.bairro}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pessoa.cidade && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Cidade
                      </label>
                      <div className="mt-1">
                        {pessoa.cidade}
                      </div>
                    </div>
                  )}

                  {pessoa.estado && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Estado
                      </label>
                      <div className="mt-1">
                        {pessoa.estado}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pessoa.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">
                  {pessoa.observacoes}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Criado em
                  </label>
                  <div className="mt-1">
                    {formatDate(pessoa.criadoEm)}
                  </div>
                </div>
                {pessoa.atualizadoEm && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Atualizado em
                    </label>
                    <div className="mt-1">
                      {formatDate(pessoa.atualizadoEm)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}