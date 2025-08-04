'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { api } from '@/lib/trpc';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { USER_ROLES } from '@/shared/constants';
import { MaterialSelector, MaterialSelecionado } from '@/components/almoxarifado/material-selector';
import { cn } from '@/lib/utils';

// Schema para o formulário local (sem transformações)
const formularioSolicitacaoSchema = z.object({
  unidadeId: z.string().min(1, 'Unidade é obrigatória'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  materiais: z
    .array(z.any()) // MaterialSelecionado[]
    .min(1, 'Deve haver pelo menos um material na solicitação')
    .max(50, 'Máximo de 50 materiais por solicitação'),
});

type FormularioSolicitacaoData = z.infer<typeof formularioSolicitacaoSchema>;

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormularioSolicitacaoData>({
    resolver: zodResolver(formularioSolicitacaoSchema),
    defaultValues: {
      unidadeId: '',
      observacoes: '',
      materiais: [],
    },
  });

  const unidadeSelecionada = watch('unidadeId');
  const materiais = watch('materiais');

  // Buscar unidades
  const { data: unidades, isLoading: carregandoUnidades } = api.base.unidades.findAll.useQuery();

  const criarSolicitacao = api.almoxarifado.criarSolicitacao.useMutation({
    onSuccess: (data) => {
      // Redireciona para a página de visualização da solicitação criada
      router.push(`/admin/almoxarifado/solicitacoes/${data.id}`);
    },
    onError: (error) => {
      console.error('Erro ao criar solicitação:', error);
    },
  });

  const onSubmit = async (data: FormularioSolicitacaoData) => {
    setSalvando(true);
    try {
      // Transformar os dados para o formato esperado pela API
      const dadosTransformados = {
        unidadeId: parseInt(data.unidadeId, 10),
        observacoes: data.observacoes,
        itens: data.materiais.map((material: MaterialSelecionado) => ({
          materialId: material.materialId,
          qtdSolicitada: material.qtdSolicitada,
        })),
      };
      await criarSolicitacao.mutateAsync(dadosTransformados);
    } catch (error) {
      setSalvando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularValorTotal = () => {
    return materiais.reduce((total: number, material: MaterialSelecionado) => {
      return total + material.valorUnitario * material.qtdSolicitada;
    }, 0);
  };

  const handleMateriaisChange = (novosMateriais: MaterialSelecionado[]) => {
    setValue('materiais', novosMateriais);
  };

  const header = (
    <PageHeader
      title="Nova Solicitação"
      subtitle="Crie uma nova solicitação de materiais"
      actions={[
        <Link key="voltar" href="/admin/almoxarifado/solicitacoes">
          <Button variant="outline" disabled={salvando}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>,
        <Button key="criar" type="submit" form="form-solicitacao" disabled={salvando}>
          <Save className="h-4 w-4 mr-2" />
          {salvando ? 'Criando...' : 'Criar Solicitação'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO, USER_ROLES.USUARIO_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <div>
          <form id="form-solicitacao" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardContent>
                <div className="flex gap-6">
                  {/* Unidade */}
                  <div className="space-y-2">
                    <Label className="required">Unidade de Destino</Label>
                    <Select value={unidadeSelecionada} onValueChange={(value) => setValue('unidadeId', value)}>
                      <SelectTrigger className={cn('w-48', { 'border-destructive': !!errors.unidadeId })}>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {carregandoUnidades ? (
                          <SelectItem value="loading" disabled>
                            Carregando unidades...
                          </SelectItem>
                        ) : unidades?.length ? (
                          unidades.map((unidade) => (
                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
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
                      {...register('observacoes')}
                      className={errors.observacoes ? 'border-destructive' : ''}
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
            <MaterialSelector materiais={materiais} onChange={handleMateriaisChange} disabled={salvando} />

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
            {criarSolicitacao.error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Erro ao criar solicitação: {criarSolicitacao.error.message}
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
