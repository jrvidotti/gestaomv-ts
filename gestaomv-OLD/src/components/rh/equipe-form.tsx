'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Departamento, Equipe } from '@/shared';

const createEquipeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
});

const updateEquipeSchema = createEquipeSchema;

type EquipeFormData = z.infer<typeof createEquipeSchema>;

interface EquipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Equipe;
  departamentos?: Departamento[];
  isLoading?: boolean;
  onSubmit: (data: EquipeFormData) => void;
  isSubmitting?: boolean;
  formId: string;
}

export function EquipeForm({
  mode,
  initialData,
  departamentos = [],
  isLoading = false,
  onSubmit,
  isSubmitting = false,
  formId,
}: EquipeFormProps) {
  const formSchema = mode === 'create' ? createEquipeSchema : updateEquipeSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      codigo: initialData?.codigo || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome || '',
        codigo: initialData.codigo || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as EquipeFormData);
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
                    <FormLabel>Nome da Equipe *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Equipe de Desenvolvimento"
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
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: EQ001" {...field} disabled={isSubmitting || isLoading} />
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
