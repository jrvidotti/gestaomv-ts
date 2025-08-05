import { MvLogo } from "@/components/icons/mv-logo";
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
import { useAuth } from "@/hooks/use-auth";
import { type EmailLoginDto, emailLoginSchema } from "@/modules/core/dtos/auth";
import {
	type TagoneLoginDto,
	tagoneLoginSchema,
} from "@/modules/core/dtos/tagone";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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

	const emailLoginForm = useForm<EmailLoginDto>({
		resolver: zodResolver(emailLoginSchema as any),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const tagoneLoginForm = useForm<TagoneLoginDto>({
		resolver: zodResolver(tagoneLoginSchema as any),
		defaultValues: {
			usuarioTagone: "",
			senha: "",
		},
	});

	// Reset erro quando mudamos o tipo de login
	useEffect(() => {
		setError("");
	}, []);

	// Reset formulários quando trocar o tipo de login
	useEffect(() => {
		if (loginType === "local") {
			tagoneLoginForm.reset();
		} else {
			emailLoginForm.reset();
		}
		setError("");
	}, [loginType, emailLoginForm, tagoneLoginForm]);

	const onEmailSubmit = async (data: EmailLoginDto) => {
		setIsLoading(true);
		setError("");

		try {
			await login(data);
			// O redirecionamento será feito automaticamente pelo useEffect que monitora isAuthenticated
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
			// O redirecionamento será feito automaticamente pelo useEffect que monitora isAuthenticated
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
		// Redirecionar baseado na role do usuário
		const user = useAuth().user;
		if (user?.roles?.includes("superadmin") && user?.id === -1) {
			return <Navigate to="/superadmin" />;
		}
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
							<Form key="email-form" {...emailLoginForm}>
								<form
									onSubmit={emailLoginForm.handleSubmit(onEmailSubmit)}
									className="space-y-4"
								>
									<FormField
										control={emailLoginForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="seu@email.com"
														disabled={isLoading}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={emailLoginForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Senha</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="••••••••"
														disabled={isLoading}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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
							</Form>
						) : (
							<Form key="tagone-form" {...tagoneLoginForm}>
								<form
									onSubmit={tagoneLoginForm.handleSubmit(onTagOneSubmit)}
									className="space-y-4"
								>
									<FormField
										control={tagoneLoginForm.control}
										name="usuarioTagone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Usuário TagOne</FormLabel>
												<FormControl>
													<Input
														placeholder="seu.usuario.tagone"
														disabled={isLoading}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={tagoneLoginForm.control}
										name="senha"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Senha TagOne</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="••••••••"
														disabled={isLoading}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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
							</Form>
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
