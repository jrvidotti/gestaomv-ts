import { MvLogo } from "@/components/icons/mv-logo";
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
import { useAuth } from "@/hooks/use-auth";
import {
	type EmailLoginDto,
	type TagoneLoginDto,
	emailLoginSchema,
	tagoneLoginSchema,
} from "@/modules/core/dtos";
import { useForm } from "@tanstack/react-form";
import { Navigate, createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [loginType, setLoginType] = useState<"local" | "tagone">("local");
	const {
		login,
		loginWithTagOne,
		isAuthenticated,
		isLoading: authLoading,
	} = useAuth();
	const router = useRouter();

	const emailLoginForm = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	const tagoneLoginForm = useForm({
		defaultValues: {
			usuarioTagone: "",
			senha: "",
		},
		onSubmit: async ({ value }) => {
			await onTagOneSubmit(value);
		},
	});

	// Reset erro quando mudamos o tipo de login
	useEffect(() => {
		setError("");
	}, []);

	const onSubmit = async (data: EmailLoginDto) => {
		setIsLoading(true);
		setError("");

		try {
			await login(data);
			// Remover navegação manual - deixar o sistema de redirecionamento automático funcionar
			// O usuário autenticado será redirecionado automaticamente pela lógica de proteção de rotas
		} catch (err) {
			setError("Credenciais inválidas. Tente novamente.");
		} finally {
			setIsLoading(false);
		}
	};

	const onTagOneSubmit = async (data: TagoneLoginDto) => {
		setIsLoading(true);
		setError("");

		try {
			await loginWithTagOne(data);
			// Remover navegação manual - deixar o sistema de redirecionamento automático funcionar
			// O usuário autenticado será redirecionado automaticamente pela lógica de proteção de rotas
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Credenciais TagOne inválidas. Tente novamente.";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Redirecionar se já estiver autenticado
	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/admin" />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<MvLogo className="w-32 h-32 border-2 border-gray-200 rounded-full bg-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Gestão MV
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Sistema de gestão empresarial
					</p>
				</div>

				<Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">
							Entrar na sua conta
						</CardTitle>
						<CardDescription className="text-center">
							Digite suas credenciais para acessar o sistema
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Toggle entre tipos de login */}
						<div className="flex rounded-lg border p-1 mb-6">
							<Button
								type="button"
								variant={loginType === "local" ? "default" : "ghost"}
								className="flex-1"
								onClick={() => setLoginType("local")}
								disabled={isLoading}
							>
								Login Local
							</Button>
							<Button
								type="button"
								variant={loginType === "tagone" ? "default" : "ghost"}
								className="flex-1"
								onClick={() => setLoginType("tagone")}
								disabled={isLoading}
							>
								Login TagOne
							</Button>
						</div>

						{loginType === "local" ? (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									emailLoginForm.handleSubmit();
								}}
								className="space-y-4"
							>
								<emailLoginForm.Field name="email">
									{(field) => (
										<div>
											<Label htmlFor={field.name}>Email</Label>
											<Input
												id={field.name}
												type="email"
												placeholder="seu@email.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												className="mt-2"
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-sm text-red-600 dark:text-red-400 mt-1">
													{field.state.meta.errors.join(", ")}
												</div>
											)}
										</div>
									)}
								</emailLoginForm.Field>
								<emailLoginForm.Field name="password">
									{(field) => (
										<div>
											<Label htmlFor={field.name}>Senha</Label>
											<Input
												id={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												className="mt-2"
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-sm text-red-600 dark:text-red-400 mt-1">
													{field.state.meta.errors.join(", ")}
												</div>
											)}
										</div>
									)}
								</emailLoginForm.Field>

								{error && (
									<div className="text-sm text-red-600 dark:text-red-400 text-center">
										{error}
									</div>
								)}

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Entrando...
										</>
									) : (
										"Entrar"
									)}
								</Button>
							</form>
						) : (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									tagoneLoginForm.handleSubmit();
								}}
								className="space-y-4"
							>
								<tagoneLoginForm.Field name="usuarioTagone">
									{(field) => (
										<div>
											<Label htmlFor={field.name}>Usuário TagOne</Label>
											<Input
												id={field.name}
												placeholder="seu.usuario.tagone"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												className="mt-2"
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-sm text-red-600 dark:text-red-400 mt-1">
													{field.state.meta.errors.join(", ")}
												</div>
											)}
										</div>
									)}
								</tagoneLoginForm.Field>
								<tagoneLoginForm.Field name="senha">
									{(field) => (
										<div>
											<Label htmlFor={field.name}>Senha TagOne</Label>
											<Input
												id={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isLoading}
												className="mt-2"
											/>
											{field.state.meta.errors.length > 0 && (
												<div className="text-sm text-red-600 dark:text-red-400 mt-1">
													{field.state.meta.errors.join(", ")}
												</div>
											)}
										</div>
									)}
								</tagoneLoginForm.Field>

								{error && (
									<div className="text-sm text-red-600 dark:text-red-400 text-center">
										{error}
									</div>
								)}

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Entrando...
										</>
									) : (
										"Entrar com TagOne"
									)}
								</Button>
							</form>
						)}

						{loginType === "local" && (
							<div className="mt-6 text-center">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Não tem uma conta?{" "}
									<Button
										variant="link"
										className="p-0 h-auto font-semibold text-primary"
										onClick={() => router.navigate({ to: "/" })}
									>
										Criar conta
									</Button>
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="mt-8 text-center">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						© 2024 Gestão MV. Todos os direitos reservados.
					</p>
				</div>
			</div>
		</div>
	);
}
