import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TagOneIntegration() {
	const trpc = useTRPC();

	const {
		data: tagoneStatus,
		isLoading: isLoadingTagone,
		refetch: refetchTagoneStatus,
	} = useQuery(trpc.tagone.getStatus.queryOptions());

	const { data: userTagone, refetch: refetchUserTagone } = useQuery(
		trpc.tagone.getUserTagOne.queryOptions(),
	);

	const [showLoginForm, setShowLoginForm] = useState(false);
	const [loginData, setLoginData] = useState({ usuarioTagone: "", senha: "" });

	const { mutate: tagoneLogin, isPending: isLoggingIn } = useMutation({
		...trpc.tagone.login.mutationOptions(),
		onSuccess: () => {
			toast.success("Login TagOne realizado com sucesso!");
			setShowLoginForm(false);
			setLoginData({ usuarioTagone: "", senha: "" });
			refetchTagoneStatus();
			refetchUserTagone();
		},
		onError: (error) => {
			toast.error(`Erro ao fazer login: ${error.message}`);
		},
	});

	const { mutate: tagoneLogout, isPending: isLoggingOut } = useMutation({
		...trpc.tagone.logout.mutationOptions(),
		onSuccess: () => {
			toast.success("Logout TagOne realizado com sucesso!");
			refetchTagoneStatus();
			refetchUserTagone();
		},
		onError: (error) => {
			toast.error(`Erro ao fazer logout: ${error.message}`);
		},
	});

	const handleTagoneLogin = () => {
		if (!loginData.usuarioTagone || !loginData.senha) {
			toast.error("Preencha todos os campos");
			return;
		}
		tagoneLogin(loginData);
	};

	const handleTagoneLogout = () => {
		tagoneLogout();
	};

	const handleCancelLogin = () => {
		setShowLoginForm(false);
		setLoginData({
			usuarioTagone: userTagone?.usuarioTagone || "",
			senha: "",
		});
	};

	// Preencher usuário TagOne se existir
	if (userTagone && !loginData.usuarioTagone && !showLoginForm) {
		setLoginData((prev) => ({
			...prev,
			usuarioTagone: userTagone.usuarioTagone,
		}));
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Link className="h-5 w-5" />
					Integração TagOne
				</CardTitle>
				<CardDescription>
					Conecte sua conta TagOne para sincronização
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoadingTagone ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="text-sm font-medium text-muted-foreground">
									Status de Conexão
								</h4>
								<div className="flex items-center gap-2 mt-1">
									{tagoneStatus?.isConnected ? (
										<>
											<Badge className="bg-green-500 hover:bg-green-600">
												{tagoneStatus.isNativeTagoneUser
													? "TagOne Nativo"
													: "Conectado"}
											</Badge>
											<span className="text-sm text-muted-foreground">
												Usuário: {tagoneStatus.usuarioTagone}
											</span>
											{tagoneStatus.isNativeTagoneUser && (
												<span className="text-xs text-blue-600">
													(Conta criada via TagOne)
												</span>
											)}
										</>
									) : (
										<Badge
											variant="outline"
											className="text-red-600 border-red-600"
										>
											Desconectado
										</Badge>
									)}
								</div>
							</div>

							{tagoneStatus?.isConnected ? (
								<Button
									variant="outline"
									size="sm"
									onClick={handleTagoneLogout}
									disabled={isLoggingOut || tagoneStatus?.isNativeTagoneUser}
									title={
										tagoneStatus?.isNativeTagoneUser
											? "Usuários nativos do TagOne não podem desconectar"
											: undefined
									}
								>
									<LogOut className="h-4 w-4 mr-2" />
									{isLoggingOut ? "Desconectando..." : "Desconectar"}
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowLoginForm(!showLoginForm)}
								>
									<LogIn className="h-4 w-4 mr-2" />
									{showLoginForm ? "Cancelar" : "Conectar"}
								</Button>
							)}
						</div>

						{tagoneStatus?.lastConnection && (
							<div>
								<h4 className="text-sm font-medium text-muted-foreground">
									Última Conexão
								</h4>
								<p className="text-sm">
									{new Date(tagoneStatus.lastConnection).toLocaleDateString(
										"pt-BR",
										{
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										},
									)}
								</p>
							</div>
						)}

						{showLoginForm && (
							<div className="space-y-3 p-4 border rounded-lg">
								<h4 className="text-sm font-medium">Conectar ao TagOne</h4>
								<div className="space-y-2">
									<div>
										<Label htmlFor="usuarioTagone">Usuário TagOne</Label>
										<Input
											id="usuarioTagone"
											value={loginData.usuarioTagone}
											onChange={(e) =>
												setLoginData((prev) => ({
													...prev,
													usuarioTagone: e.target.value,
												}))
											}
											placeholder="Digite seu usuário TagOne"
											disabled={isLoggingIn}
										/>
									</div>
									<div>
										<Label htmlFor="senha">Senha</Label>
										<Input
											id="senha"
											type="password"
											value={loginData.senha}
											onChange={(e) =>
												setLoginData((prev) => ({
													...prev,
													senha: e.target.value,
												}))
											}
											onKeyDown={(e) =>
												e.key === "Enter" && handleTagoneLogin()
											}
											placeholder="Digite sua senha"
											disabled={isLoggingIn}
										/>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleTagoneLogin}
										disabled={isLoggingIn}
										size="sm"
									>
										{isLoggingIn ? "Conectando..." : "Conectar"}
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCancelLogin}
									>
										Cancelar
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
