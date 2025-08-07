import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  type ChangePasswordDto,
  changePasswordSchema,
} from "@/modules/core/dtos/users";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CheckCircle, Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/_me/alterar-senha")({
  component: AlterarSenhaPage,
});

function AlterarSenhaPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const changePasswordMutation = useMutation({
    ...trpc.core.auth.mudarSenha.mutationOptions(),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      router.navigate({ to: "/admin/user/profile" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordDto) => {
    changePasswordMutation.mutate(data);
  };

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Alterar Senha</h1>
          <p className="text-muted-foreground">
            Altere sua senha de acesso ao sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Digite sua senha atual e a nova senha para alterar seu acesso ao
              sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Senha Atual */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Digite sua senha atual"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleShowPassword("current")}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nova Senha */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="Digite sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleShowPassword("new")}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {field.value &&
                        field.value.length >= 6 &&
                        !form.formState.errors.newPassword && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Senha forte
                          </div>
                        )}
                    </FormItem>
                  )}
                />

                {/* Confirmar Nova Senha */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Confirme sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleShowPassword("confirm")}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {field.value &&
                        form.watch("newPassword") === field.value &&
                        !form.formState.errors.confirmPassword && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Senhas coincidem
                          </div>
                        )}
                    </FormItem>
                  )}
                />

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      changePasswordMutation.isPending ||
                      !form.formState.isValid
                    }
                    className="flex-1"
                  >
                    {changePasswordMutation.isPending
                      ? "Alterando..."
                      : "Alterar Senha"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.history.back()}
                    disabled={changePasswordMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
