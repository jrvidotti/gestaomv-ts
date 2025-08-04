'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { api } from '@/lib/trpc';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { FiltrosMateriais } from '@/shared';
import { LookupSelect } from '@/components/lookup-select';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { Thumbnail } from '@/components/ui/thumbnail';

export default function MateriaisPage() {
  const [busca, setBusca] = useState('');
  const [tipoSelecionadoId, setTipoSelecionadoId] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const buscaDebounced = useDebounce(busca, 300);

  const filtros: FiltrosMateriais = {
    busca: buscaDebounced || undefined,
    tipoMaterialId: tipoSelecionadoId && tipoSelecionadoId !== 'all' ? tipoSelecionadoId : undefined,
    pagina: paginaAtual,
    limite: 20,
  };

  const { data, isLoading, refetch } = api.almoxarifado.listarMateriais.useQuery(filtros);
  const { data: tiposMaterialData, isLoading: isLoadingTiposMaterial } =
    api.almoxarifado.listarTiposMaterial.useQuery();

  const inativarMaterial = api.almoxarifado.inativarMaterial.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleInativar = async (id: number) => {
    if (confirm('Deseja realmente inativar este material?')) {
      try {
        await inativarMaterial.mutateAsync({ id });
      } catch (error) {
        console.error('Erro ao inativar material:', error);
      }
    }
  };

  const limparFiltros = () => {
    setBusca('');
    setTipoSelecionadoId('all');
    setPaginaAtual(1);
  };

  const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

  const header = (
    <PageHeader
      title="Materiais"
      subtitle="Gerencie o catálogo de materiais do almoxarifado"
      actions={[
        <Link key="novo-material" href="/admin/almoxarifado/materiais/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        </Link>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO, USER_ROLES.USUARIO_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>Use os filtros abaixo para encontrar materiais específicos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label htmlFor="busca" className="text-sm font-medium mb-2 block">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="busca"
                      placeholder="Buscar por nome ou descrição..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <LookupSelect
                    className="w-64"
                    value={tipoSelecionadoId ?? 'all'}
                    onValueChange={(val) => setTipoSelecionadoId(val && val !== 'all' ? val : null)}
                    options={
                      tiposMaterialData?.map((e) => ({
                        value: e.id.toString(),
                        label: e.nome,
                      })) ?? []
                    }
                    placeholder="Selecione um tipo"
                    emptyMessage={isLoadingTiposMaterial ? 'Carregando...' : 'Nenhum tipo selecionada'}
                    disabled={isLoading || isLoadingTiposMaterial}
                  />
                </div>
                <Button variant="outline" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Materiais */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais Cadastrados</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : `${data?.total || 0} materiais encontrados`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Carregando materiais...</p>
                </div>
              ) : !data?.materiais.length ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {busca || tipoSelecionadoId
                      ? 'Tente ajustar os filtros para encontrar materiais.'
                      : 'Comece cadastrando o primeiro material do almoxarifado.'}
                  </p>
                  {!busca && !tipoSelecionadoId && (
                    <Link href="/admin/almoxarifado/materiais/novo">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeiro Material
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Foto</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.materiais.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            <Link href={`/admin/almoxarifado/materiais/${material.id}/edit`}>
                              <Thumbnail src={material.foto} alt={material.nome} size="medium" fallbackIcon={Package} />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/almoxarifado/materiais/${material.id}/edit`}
                              className="block hover:underline"
                            >
                              <div>
                                <p className="font-medium">{material.nome}</p>
                                {material.descricao && (
                                  <p className="text-sm text-muted-foreground">{material.descricao}</p>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{material.tipoMaterial?.nome}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{formatCurrency(material.valorUnitario)}</TableCell>
                          <TableCell>{material.unidadeMedida?.nome}</TableCell>
                          <TableCell>
                            <Badge variant={material.ativo ? 'default' : 'secondary'}>
                              {material.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/admin/almoxarifado/materiais/${material.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizar
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/admin/almoxarifado/materiais/${material.id}/edit`}>
                                  <DropdownMenuItem>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                </Link>
                                {material.ativo && (
                                  <DropdownMenuItem
                                    onClick={() => handleInativar(material.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Inativar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Página {paginaAtual} de {totalPaginas}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                          disabled={paginaAtual === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
                          disabled={paginaAtual === totalPaginas}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
