'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';
import { Departamento } from '@/shared';

const createDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

const updateDepartamentoSchema = createDepartamentoSchema;

type DepartamentoFormData = z.infer<typeof createDepartamentoSchema>;

interface DepartamentoFormProps {
  mode: 'create' | 'edit';
  initialData?: Departamento;
  isLoading?: boolean;
  onSubmit: (data: DepartamentoFormData) => void;
  isSubmitting?: boolean;
  formId: string;
}

export function DepartamentoForm({
  mode,
  initialData,
  isLoading = false,
  onSubmit,
  isSubmitting = false,
  formId,
}: DepartamentoFormProps) {
  const formSchema = mode === 'create' ? createDepartamentoSchema : updateDepartamentoSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as DepartamentoFormData);
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
                    <FormLabel>Nome do Departamento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recursos Humanos" {...field} disabled={isSubmitting || isLoading} />
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
                        placeholder="Descreva as responsabilidades e funções do departamento..."
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
