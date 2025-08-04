import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/integrations/trpc/react";
import { changePasswordSchema } from "@/modules/core/dtos/users";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { AlertCircle, CheckCircle, Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/user/alterar-senha")({
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
		...trpc.auth.changePassword.mutationOptions(),
		onSuccess: () => {
			toast.success("Senha alterada com sucesso!");
			router.navigate({ to: "/admin/user/profile" });
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao alterar senha");
		},
	});

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			changePasswordMutation.mutate(value);
		},
		validatorAdapter: zodValidator(),
		validators: {
			onChange: changePasswordSchema,
		},
	});

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
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							{/* Senha Atual */}
							<form.Field
								name="currentPassword"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor="currentPassword">Senha Atual</Label>
										<div className="relative">
											<Input
												id="currentPassword"
												type={showPasswords.current ? "text" : "password"}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Digite sua senha atual"
												className={
													field.state.meta.errors.length ? "border-red-500" : ""
												}
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
										{field.state.meta.errors.length > 0 && (
											<div className="flex items-center gap-1 text-sm text-red-500">
												<AlertCircle className="h-4 w-4" />
												{field.state.meta.errors[0]}
											</div>
										)}
									</div>
								)}
							/>

							{/* Nova Senha */}
							<form.Field
								name="newPassword"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor="newPassword">Nova Senha</Label>
										<div className="relative">
											<Input
												id="newPassword"
												type={showPasswords.new ? "text" : "password"}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Digite sua nova senha"
												className={
													field.state.meta.errors.length ? "border-red-500" : ""
												}
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
										{field.state.meta.errors.length > 0 && (
											<div className="flex items-center gap-1 text-sm text-red-500">
												<AlertCircle className="h-4 w-4" />
												{field.state.meta.errors[0]}
											</div>
										)}
										{field.state.value &&
											field.state.value.length >= 6 &&
											!field.state.meta.errors.length && (
												<div className="flex items-center gap-1 text-sm text-green-600">
													<CheckCircle className="h-4 w-4" />
													Senha forte
												</div>
											)}
									</div>
								)}
							/>

							{/* Confirmar Nova Senha */}
							<form.Field
								name="confirmPassword"
								children={(field) => (
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirmar Nova Senha
										</Label>
										<div className="relative">
											<Input
												id="confirmPassword"
												type={showPasswords.confirm ? "text" : "password"}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="Confirme sua nova senha"
												className={
													field.state.meta.errors.length ? "border-red-500" : ""
												}
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
										{field.state.meta.errors.length > 0 && (
											<div className="flex items-center gap-1 text-sm text-red-500">
												<AlertCircle className="h-4 w-4" />
												{field.state.meta.errors[0]}
											</div>
										)}
										<form.Subscribe
											selector={(state) => [
												state.values.newPassword,
												state.values.confirmPassword,
											]}
											children={([newPassword, confirmPassword]) => {
												if (
													confirmPassword &&
													newPassword === confirmPassword &&
													!field.state.meta.errors.length
												) {
													return (
														<div className="flex items-center gap-1 text-sm text-green-600">
															<CheckCircle className="h-4 w-4" />
															Senhas coincidem
														</div>
													);
												}
												return null;
											}}
										/>
									</div>
								)}
							/>

							{/* Botões de Ação */}
							<div className="flex gap-3 pt-4">
								<Button
									type="submit"
									disabled={
										changePasswordMutation.isPending || !form.state.canSubmit
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
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
