'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LookupSelect } from '../lookup-select';
import { Cargo, Departamento } from '@/shared';

const createCargoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  departamentoId: z.number().min(1, 'Departamento é obrigatório'),
});

const updateCargoSchema = createCargoSchema;

type CargoFormData = z.infer<typeof createCargoSchema>;

interface CargoFormProps {
  mode: 'create' | 'edit';
  initialData?: Cargo;
  departamentos?: Departamento[];
  isLoading?: boolean;
  onSubmit: (data: CargoFormData) => void;
  isSubmitting?: boolean;
  formId: string;
}

export function CargoForm({
  mode,
  initialData,
  departamentos = [],
  isLoading = false,
  onSubmit,
  isSubmitting = false,
  formId,
}: CargoFormProps) {
  const formSchema = mode === 'create' ? createCargoSchema : updateCargoSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      departamentoId: initialData?.departamentoId || 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
        departamentoId: initialData.departamentoId || 0,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as CargoFormData);
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cargo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Desenvolvedor Full Stack"
                        {...field}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento *</FormLabel>
                    <FormControl>
                      <LookupSelect
                        value={field.value?.toString()}
                        onValueChange={field.onChange}
                        options={departamentos.map((e) => ({
                          value: e.id.toString(),
                          label: e.nome,
                        }))}
                        placeholder="Selecione um departamento"
                        emptyMessage="Nenhum departamento selecionada"
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as responsabilidades e requisitos do cargo..."
                        {...field}
                        disabled={isSubmitting || isLoading}
                        rows={3}
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
