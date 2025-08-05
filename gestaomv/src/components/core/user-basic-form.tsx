"use client";

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
import { Switch } from "@/components/ui/switch";
import { createUserSchema, updateUserSchema } from "@/modules/core/dtos";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type CreateUserData = z.infer<typeof createUserSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;

interface UserBasicFormProps {
	mode: "create" | "edit";
	initialData?: {
		name: string;
		email: string;
		isActive: boolean;
	};
	onSubmit: (data: CreateUserData | UpdateUserData) => void | Promise<void>;
	isSubmitting?: boolean;
}

export function UserBasicForm({
	mode,
	initialData,
	onSubmit,
	isSubmitting = false,
}: UserBasicFormProps) {
	const schema = mode === "create" ? createUserSchema : updateUserSchema;

	const form = useForm<CreateUserData | UpdateUserData>({
		resolver: zodResolver(schema),
		defaultValues:
			mode === "create"
				? {
						name: "",
						email: "",
						password: "",
						isActive: true,
						roles: [],
					}
				: {
						name: "",
						email: "",
						isActive: true,
					},
	});

	// Pré-preencher formulário no modo de edição
	useEffect(() => {
		if (mode === "edit" && initialData) {
			form.reset({
				name: initialData.name,
				email: initialData.email,
				isActive: initialData.isActive,
			});
		}
	}, [mode, initialData, form]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					{mode === "create"
						? "Dados do Novo Usuário"
						: "Dados Básicos do Usuário"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome Completo *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Digite o nome completo" />
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
										<FormLabel>Email *</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="email"
												placeholder="Digite o email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{mode === "create" && (
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Senha *</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												placeholder="Digite a senha (mínimo 6 caracteres)"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Status do Usuário
										</FormLabel>
										<div className="text-sm text-muted-foreground">
											{field.value
												? "Usuário ativo no sistema"
												: "Usuário inativo no sistema"}
										</div>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{mode === "create" && (
							<div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
								<p className="font-medium mb-2">Sobre as permissões:</p>
								<p>
									O usuário será criado inicialmente sem nenhuma permissão
									específica. Após a criação, você poderá configurar as
									permissões necessárias na tela de edição.
								</p>
							</div>
						)}

						<div className="flex justify-end pt-4">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? "Salvando..."
									: mode === "create"
										? "Criar Usuário"
										: "Salvar Alterações"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
