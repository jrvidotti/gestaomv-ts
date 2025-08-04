"use client";

import { ImageUpload } from "@/components/image-upload";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
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
import { useTRPC } from "@/integrations/trpc/react";
import { formMaterialSchema } from "@/modules/almoxarifado/dtos";
import type { Material } from "@/modules/almoxarifado/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { LookupSelect } from "../lookup-select";

type MaterialFormData = z.infer<typeof formMaterialSchema>;

interface MaterialFormProps {
	mode: "create" | "edit";
	initialData?: Material;
	isLoading?: boolean;
	onSubmit: (data: MaterialFormData) => void;
	isSubmitting?: boolean;
	formId: string;
}

export function MaterialForm({
	mode,
	initialData,
	isLoading = false,
	onSubmit,
	isSubmitting = false,
	formId,
}: MaterialFormProps) {
	const trpc = useTRPC();

	const { data: tiposMaterialData, isLoading: isLoadingTiposMaterial } =
		useQuery(trpc.almoxarifado.materiais.listarTiposMaterial.queryOptions());
	const { data: unidadesMedidaData, isLoading: isLoadingUnidadesMedida } =
		useQuery(trpc.almoxarifado.materiais.listarUnidadesMedida.queryOptions());

	const form = useForm({
		// TODO: Remover any
		resolver: zodResolver(formMaterialSchema as any),
		defaultValues: {
			nome: initialData?.nome || "",
			descricao: initialData?.descricao || "",
			tipoMaterialId: initialData?.tipoMaterialId || undefined,
			valorUnitario: initialData?.valorUnitario || 0,
			foto: initialData?.foto || "",
			unidadeMedidaId: initialData?.unidadeMedidaId || "UN",
			ativo: initialData?.ativo ?? true,
		},
	});

	// Atualizar formulário quando initialData mudar (útil para modo edit)
	useEffect(() => {
		if (initialData) {
			form.reset({
				nome: initialData.nome || "",
				descricao: initialData.descricao || "",
				tipoMaterialId: initialData.tipoMaterialId || undefined,
				valorUnitario: initialData.valorUnitario || 0,
				foto: initialData.foto || "",
				unidadeMedidaId: initialData.unidadeMedidaId || "UN",
				ativo: initialData.ativo ?? true,
			});
		}
	}, [initialData, form]);

	const handleSubmit = (values: z.infer<typeof formMaterialSchema>) => {
		onSubmit(values as MaterialFormData);
	};

	return (
		<Card>
			<CardContent>
				<Form {...form}>
					<form
						id={formId}
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Nome */}
						<FormField
							control={form.control}
							name="nome"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome do Material *</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: Papel A4, Caneta Azul..."
											{...field}
											disabled={isSubmitting || isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Descrição */}
						<FormField
							control={form.control}
							name="descricao"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descrição</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Descrição detalhada do material (opcional)"
											rows={3}
											{...field}
											disabled={isSubmitting || isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-6 md:grid-cols-2">
							{/* Tipo */}
							<FormField
								control={form.control}
								name="tipoMaterialId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Material *</FormLabel>
										<FormControl>
											<LookupSelect
												value={field.value?.toString()}
												onValueChange={field.onChange}
												options={
													tiposMaterialData?.map((e) => ({
														value: e.id.toString(),
														label: e.nome,
													})) ?? []
												}
												placeholder="Selecione um tipo"
												emptyMessage={
													isLoadingTiposMaterial
														? "Carregando..."
														: "Nenhum tipo selecionada"
												}
												disabled={
													isSubmitting || isLoading || isLoadingTiposMaterial
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Unidade de Medida */}
							<FormField
								control={form.control}
								name="unidadeMedidaId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Unidade de Medida *</FormLabel>
										<FormControl>
											<LookupSelect
												value={field.value?.toString()}
												onValueChange={field.onChange}
												options={
													unidadesMedidaData?.map((e) => ({
														value: e.id.toString(),
														label: e.nome,
													})) ?? []
												}
												placeholder="Selecione uma unidade"
												emptyMessage={
													isLoadingUnidadesMedida
														? "Carregando..."
														: "Nenhuma unidade selecionada"
												}
												disabled={
													isSubmitting || isLoading || isLoadingUnidadesMedida
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Valor Unitário */}
						<FormField
							control={form.control}
							name="valorUnitario"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Valor Unitário *</FormLabel>
									<FormControl>
										<CurrencyInput
											value={field.value}
											onChange={field.onChange}
											min={0}
											disabled={isSubmitting || isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Foto do Material */}
						<FormField
							control={form.control}
							name="foto"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Foto do Material</FormLabel>
									<FormControl>
										<ImageUpload
											value={field.value}
											onChange={field.onChange}
											disabled={isSubmitting || isLoading}
											placeholder="Adicionar foto do material"
											maxSizeInMB={5}
											acceptedTypes={[
												"image/jpeg",
												"image/jpg",
												"image/png",
												"image/webp",
											]}
										/>
									</FormControl>
									<FormMessage />
									<p className="text-sm text-muted-foreground">
										Opcional. Faça upload de uma imagem do material (JPG, PNG ou
										WebP, máximo 5MB).
									</p>
								</FormItem>
							)}
						/>

						{/* Status Ativo (apenas no modo edit) */}
						{mode === "edit" && (
							<FormField
								control={form.control}
								name="ativo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											value={field.value ? "true" : "false"}
											onValueChange={(value) =>
												field.onChange(value === "true")
											}
											disabled={isSubmitting || isLoading}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="true">Ativo</SelectItem>
												<SelectItem value="false">Inativo</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
