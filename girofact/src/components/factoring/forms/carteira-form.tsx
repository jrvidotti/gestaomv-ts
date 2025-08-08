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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const carteiraFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  banco: z.string().min(1, "Banco é obrigatório"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  chavePix: z.string().optional(),
});

type CarteiraFormData = z.infer<typeof carteiraFormSchema>;

interface CarteiraFormProps {
  initialData?: Partial<CarteiraFormData>;
  onSubmit: (data: CarteiraFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function CarteiraForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
}: CarteiraFormProps) {
  const form = useForm<CarteiraFormData>({
    resolver: zodResolver(carteiraFormSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      banco: initialData?.banco || "",
      agencia: initialData?.agencia || "",
      conta: initialData?.conta || "",
      chavePix: initialData?.chavePix || "",
    },
  });

  const handleSubmit = (data: CarteiraFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova Carteira" : "Editar Carteira"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Carteira</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Conta Corrente Principal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Banco do Brasil" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 1234-5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 12345-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chavePix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="CPF, CNPJ, e-mail ou chave aleatória"
                      />
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
  );
}