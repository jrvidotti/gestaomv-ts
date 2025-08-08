import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const pessoaFormSchema = z.object({
  tipoPessoa: z.enum(["fisica", "juridica"]),
  documento: z.string().min(11, "Documento é obrigatório"),
  nomeRazaoSocial: z.string().min(1, "Nome/Razão social é obrigatório"),
  nomeFantasia: z.string().optional(),
  dataNascimentoFundacao: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  nomeMae: z.string().optional(),
  sexo: z.enum(["masculino", "feminino", "nao_informado"]).optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  observacoes: z.string().optional(),
  // Endereço
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
});

type PessoaFormData = z.infer<typeof pessoaFormSchema>;

interface PessoaFormProps {
  initialData?: Partial<PessoaFormData>;
  onSubmit: (data: PessoaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
  onBuscarCep?: (cep: string) => void;
  onBuscarDocumento?: (documento: string) => void;
}

export function PessoaForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
  onBuscarCep,
  onBuscarDocumento,
}: PessoaFormProps) {
  const form = useForm<PessoaFormData>({
    resolver: zodResolver(pessoaFormSchema),
    defaultValues: {
      tipoPessoa: initialData?.tipoPessoa || "fisica",
      documento: initialData?.documento || "",
      nomeRazaoSocial: initialData?.nomeRazaoSocial || "",
      nomeFantasia: initialData?.nomeFantasia || "",
      dataNascimentoFundacao: initialData?.dataNascimentoFundacao || "",
      inscricaoEstadual: initialData?.inscricaoEstadual || "",
      inscricaoMunicipal: initialData?.inscricaoMunicipal || "",
      nomeMae: initialData?.nomeMae || "",
      sexo: initialData?.sexo || "nao_informado",
      email: initialData?.email || "",
      observacoes: initialData?.observacoes || "",
      cep: initialData?.cep || "",
      logradouro: initialData?.logradouro || "",
      numero: initialData?.numero || "",
      complemento: initialData?.complemento || "",
      bairro: initialData?.bairro || "",
      cidade: initialData?.cidade || "",
      estado: initialData?.estado || "",
    },
  });

  const tipoPessoa = form.watch("tipoPessoa");

  const handleSubmit = (data: PessoaFormData) => {
    // Converter "nao_informado" para undefined para o backend
    const submitData = {
      ...data,
      sexo: data.sexo === "nao_informado" ? undefined : data.sexo,
    };
    onSubmit(submitData);
  };

  const handleBuscarDocumento = () => {
    const documento = form.getValues("documento");
    if (documento && onBuscarDocumento) {
      onBuscarDocumento(documento);
    }
  };

  const handleBuscarCep = () => {
    const cep = form.getValues("cep");
    if (cep && onBuscarCep) {
      onBuscarCep(cep);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Nova Pessoa" : "Editar Pessoa"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Dados Básicos</h3>
                
                <FormField
                  control={form.control}
                  name="tipoPessoa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pessoa</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fisica">Pessoa Física</SelectItem>
                          <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="documento"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          {tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              tipoPessoa === "fisica" ? "000.000.000-00" : "00.000.000/0000-00"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {onBuscarDocumento && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBuscarDocumento}
                      className="mt-8"
                    >
                      Buscar
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="nomeRazaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {tipoPessoa === "fisica" ? "Nome Completo" : "Razão Social"}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tipoPessoa === "juridica" && (
                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataNascimentoFundacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {tipoPessoa === "fisica" ? "Data de Nascimento" : "Data de Fundação"}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {tipoPessoa === "fisica" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeMae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Mãe</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nao_informado">Não informado</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {tipoPessoa === "juridica" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inscricaoEstadual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inscricaoMunicipal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Municipal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Endereço</h3>
                
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="00000-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {onBuscarCep && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBuscarCep}
                      className="mt-8"
                    >
                      Buscar
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}