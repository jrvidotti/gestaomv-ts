'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Building } from 'lucide-react';
import { createEmpresaSchema, Empresa, updateEmpresaSchema } from '@/shared';

type EmpresaFormData = z.infer<typeof createEmpresaSchema>;

interface EmpresaFormProps {
  mode: 'create' | 'edit';
  initialData?: Empresa;
  onSubmit: (data: EmpresaFormData) => void;
  isSubmitting?: boolean;
  formId: string;
  showUnidadesInfo?: boolean;
}

export function EmpresaForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
  formId,
  showUnidadesInfo = false,
}: EmpresaFormProps) {
  const formSchema = mode === 'create' ? createEmpresaSchema : updateEmpresaSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      razaoSocial: initialData?.razaoSocial || '',
      nomeFantasia: initialData?.nomeFantasia || '',
      cnpj: initialData?.cnpj || '',
      pontowebId: initialData?.pontowebId || undefined,
    },
  });

  // Atualizar formulário quando initialData mudar (útil para modo edit)
  useEffect(() => {
    if (initialData) {
      form.reset({
        razaoSocial: initialData.razaoSocial || '',
        nomeFantasia: initialData.nomeFantasia || '',
        cnpj: initialData.cnpj || '',
        pontowebId: initialData.pontowebId ?? undefined,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as EmpresaFormData);
  };

  // Função para formatar CNPJ durante digitação
  const formatCnpj = (value: string) => {
    // Remove tudo que não for dígito
    const cleaned = value.replace(/\D/g, '');

    // Aplica máscara
    if (cleaned.length <= 14) {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }

    return value; // Retorna sem formatação se exceder 14 dígitos
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Empresa XYZ Ltda" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomeFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: XYZ Company" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCnpj(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={18}
                        disabled={isSubmitting}
                      />
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
                        placeholder="Ex: 1001"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showUnidadesInfo && initialData?.unidades && initialData.unidades.length > 0 && (
              <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Esta empresa possui {initialData.unidades.length} unidade(s) vinculada(s)
                  </span>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
