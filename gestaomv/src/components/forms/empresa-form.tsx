"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createEmpresaSchema, updateEmpresaSchema, type CreateEmpresaDto, type UpdateEmpresaDto } from '@/modules/core/dtos'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

interface EmpresaFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    razaoSocial: string
    nomeFantasia?: string | null
    cnpj: string
    pontowebId?: number | null
  }
  onSubmit: (data: CreateEmpresaDto | UpdateEmpresaDto) => Promise<void>
  isSubmitting?: boolean
}

export function EmpresaForm({ mode, initialData, onSubmit, isSubmitting = false }: EmpresaFormProps) {
  const schema = mode === 'create' ? createEmpresaSchema : updateEmpresaSchema
  
  const form = useForm<CreateEmpresaDto | UpdateEmpresaDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      pontowebId: undefined,
    }
  })

  // Pré-preencher formulário no modo de edição
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        razaoSocial: initialData.razaoSocial,
        nomeFantasia: initialData.nomeFantasia || '',
        cnpj: initialData.cnpj,
        pontowebId: initialData.pontowebId || undefined,
      })
    }
  }, [mode, initialData, form])

  const formatCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 14 dígitos
    const limited = numbers.slice(0, 14)
    
    // Aplica a máscara
    if (limited.length <= 2) return limited
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {mode === 'create' ? 'Dados da Nova Empresa' : 'Dados da Empresa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite a razão social" />
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
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Digite o nome fantasia (opcional)" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={formatCNPJ(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
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
                    <FormLabel>PontoWeb ID</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="ID do PontoWeb (opcional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (mode === 'create' ? 'Criar Empresa' : 'Salvar Alterações')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}