"use client";

import { LookupSelect } from "@/components/lookup-select";
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
	type CreateUnidadeDto,
	type UpdateUnidadeDto,
	createUnidadeSchema,
	updateUnidadeSchema,
} from "@/modules/core/dtos";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UnidadeFormProps {
	mode: "create" | "edit";
	initialData?: {
		nome: string;
		codigo: number;
		empresaId?: number | null;
		endereco?: string | null;
		cidade?: string | null;
		estado?: string | null;
		telefone?: string | null;
		pontowebId?: number | null;
	};
	onSubmit: (data: CreateUnidadeDto | UpdateUnidadeDto) => Promise<void>;
	isSubmitting?: boolean;
}

export function UnidadeForm({
	mode,
	initialData,
	onSubmit,
	isSubmitting = false,
}: UnidadeFormProps) {
	const schema = mode === "create" ? createUnidadeSchema : updateUnidadeSchema;

	const trpc = useTRPC();

	// Buscar empresas para o select
	const { data: empresas, isLoading: empresasLoading } = useQuery(
		trpc.empresas.findAll.queryOptions(),
	);

	const form = useForm<CreateUnidadeDto | UpdateUnidadeDto>({
		resolver: zodResolver(schema),
		defaultValues: {
			nome: "",
			codigo: undefined,
			empresaId: undefined,
			endereco: "",
			cidade: "",
			estado: "",
			telefone: "",
			pontowebId: undefined,
		},
	});

	// Pré-preencher formulário no modo de edição
	useEffect(() => {
		if (mode === "edit" && initialData) {
			form.reset({
				nome: initialData.nome,
				codigo: initialData.codigo,
				empresaId: initialData.empresaId || undefined,
				endereco: initialData.endereco || "",
				cidade: initialData.cidade || "",
				estado: initialData.estado || "",
				telefone: initialData.telefone || "",
				pontowebId: initialData.pontowebId || undefined,
			});
		}
	}, [mode, initialData, form]);

	// Preparar opções de empresas para o select
	const empresaOptions =
		empresas?.map((empresa) => ({
			value: empresa.id.toString(),
			label: `${empresa.razaoSocial} (${empresa.cnpj})`,
		})) || [];

	const formatTelefone = (value: string) => {
		// Remove todos os caracteres não numéricos
		const numbers = value.replace(/\D/g, "");

		// Limita a 11 dígitos
		const limited = numbers.slice(0, 11);

		// Aplica a máscara
		if (limited.length <= 2) return limited;
		if (limited.length <= 6)
			return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
		if (limited.length <= 10)
			return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
		return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MapPin className="h-5 w-5" />
					{mode === "create" ? "Dados da Nova Unidade" : "Dados da Unidade"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Dados Básicos */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium text-muted-foreground">
								Dados Básicos
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="nome"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome *</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Nome da unidade" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="codigo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Código *</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													value={field.value || ""}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number(e.target.value)
																: undefined,
														)
													}
													placeholder="Código numérico"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="empresaId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Empresa</FormLabel>
										<FormControl>
											<LookupSelect
												value={field.value?.toString() || null}
												onValueChange={(value) =>
													field.onChange(value ? Number(value) : undefined)
												}
												options={empresaOptions}
												placeholder="Selecione uma empresa"
												emptyMessage="Nenhuma empresa selecionada"
												disabled={empresasLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Localização */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium text-muted-foreground">
								Localização
							</h3>
							<FormField
								control={form.control}
								name="endereco"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Endereço</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value || ""}
												placeholder="Endereço completo (opcional)"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="cidade"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cidade</FormLabel>
											<FormControl>
												<Input
													{...field}
													value={field.value || ""}
													placeholder="Cidade (opcional)"
												/>
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
												<Input
													{...field}
													value={field.value || ""}
													placeholder="Estado (opcional)"
													maxLength={2}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Contato e Integrações */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium text-muted-foreground">
								Contato e Integrações
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="telefone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Telefone</FormLabel>
											<FormControl>
												<Input
													{...field}
													value={formatTelefone(field.value || "")}
													onChange={(e) => field.onChange(e.target.value)}
													placeholder="(00) 00000-0000"
													maxLength={15}
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
													value={field.value || ""}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? Number(e.target.value)
																: undefined,
														)
													}
													placeholder="ID do PontoWeb (opcional)"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? "Salvando..."
									: mode === "create"
										? "Criar Unidade"
										: "Salvar Alterações"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
