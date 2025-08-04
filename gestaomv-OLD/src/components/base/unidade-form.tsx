'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LookupSelect } from '@/components/lookup-select';
import { createUnidadeSchema, Empresa, Unidade, updateUnidadeSchema } from '@/shared';

type UnidadeFormData = z.infer<typeof createUnidadeSchema>;

interface UnidadeFormProps {
  mode: 'create' | 'edit';
  initialData?: Unidade;
  empresas: Empresa[];
  isLoading?: boolean;
  onSubmit: (data: UnidadeFormData) => void;
  isSubmitting?: boolean;
  formId: string;
}

export function UnidadeForm({
  mode,
  initialData,
  empresas,
  isLoading = false,
  onSubmit,
  isSubmitting = false,
  formId,
}: UnidadeFormProps) {
  const formSchema = mode === 'create' ? createUnidadeSchema : updateUnidadeSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      codigo: initialData?.codigo || 0,
      empresaId: initialData?.empresaId || undefined,
      endereco: initialData?.endereco || '',
      cidade: initialData?.cidade || '',
      estado: initialData?.estado || '',
      telefone: initialData?.telefone || '',
      pontowebId: initialData?.pontowebId || undefined,
    },
  });

  // Atualizar formulário quando initialData mudar (útil para modo edit)
  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome || '',
        codigo: initialData.codigo || 0,
        empresaId: initialData.empresaId ?? undefined,
        endereco: initialData.endereco || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || '',
        telefone: initialData.telefone || '',
        pontowebId: initialData.pontowebId ?? undefined,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as UnidadeFormData);
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="empresaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <LookupSelect
                        value={field.value?.toString()}
                        onValueChange={field.onChange}
                        options={empresas.map((e) => ({
                          value: e.id.toString(),
                          label: e.razaoSocial,
                        }))}
                        placeholder="Selecione uma empresa"
                        emptyMessage="Nenhuma empresa selecionada"
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Matriz São Paulo" {...field} disabled={isSubmitting || isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 1001"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rua das Flores, 123, Centro"
                      {...field}
                      disabled={isSubmitting || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo" {...field} disabled={isSubmitting || isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SP" {...field} disabled={isSubmitting || isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 99999-9999" {...field} disabled={isSubmitting || isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pontowebId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID PontoWeb</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 5001"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
