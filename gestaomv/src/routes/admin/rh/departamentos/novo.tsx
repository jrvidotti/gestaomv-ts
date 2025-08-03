import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { useTRPC } from '@/integrations/trpc/react'
import { useMutation } from '@tanstack/react-query'
import { USER_ROLES } from '@/modules/core/enums'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/rh/departamentos/novo')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const trpc = useTRPC()

  const { mutate: criarDepartamento, isPending } = useMutation({
    ...trpc.rh.criarDepartamento.mutationOptions(),
    onSuccess: () => {
      toast.success('Departamento criado com sucesso!')
      navigate({ to: '/admin/rh/departamentos' })
    },
    onError: (error) => {
      toast.error(`Erro ao criar departamento: ${error.message}`)
    },
  })

  const form = useForm({
    defaultValues: {
      nome: '',
      codigo: '',
      descricao: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.nome.trim()) {
        toast.error('Nome é obrigatório')
        return
      }
      criarDepartamento(value)
    },
  })

  const header = (
    <PageHeader
      title="Novo Departamento"
      subtitle="Cadastre um novo departamento na empresa"
      actions={[
        <Button key="voltar" variant="outline" onClick={() => navigate({ to: '/admin/rh/departamentos' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>,
      ]}
    />
  )

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Departamento</CardTitle>
              <CardDescription>
                Preencha as informações básicas do novo departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="space-y-6"
              >
                {/* Nome */}
                <form.Field name="nome">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Nome *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ex: Recursos Humanos"
                      />
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Código */}
                <form.Field name="codigo">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Código</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ex: RH"
                        className="font-mono"
                      />
                      <p className="text-sm text-muted-foreground">
                        Código identificador do departamento (opcional)
                      </p>
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Descrição */}
                <form.Field name="descricao">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Descrição</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Descreva as responsabilidades e objetivos do departamento..."
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Descrição detalhada do departamento (opcional)
                      </p>
                      {field.state.meta.errors && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/admin/rh/departamentos' })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Salvando...' : 'Salvar Departamento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}