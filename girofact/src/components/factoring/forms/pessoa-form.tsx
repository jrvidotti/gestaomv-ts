import { DadosBancariosTable } from "@/components/factoring/tables/dados-bancarios-table";
import { TelefonesTable } from "@/components/factoring/tables/telefones-table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
	DadosBancariosDto,
	TelefoneDto,
} from "@/modules/factoring/dtos/pessoas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
	email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
	observacoesGerais: z.string().optional(),
	// Endereço
	cep: z.string().optional(),
	logradouro: z.string().optional(),
	numero: z.string().optional(),
	complemento: z.string().optional(),
	bairro: z.string().optional(),
	cidade: z.string().optional(),
	estado: z.string().optional(),
});

interface TelefoneEdit extends TelefoneDto {
	id?: number;
	isEditing?: boolean;
	isNew?: boolean;
}

interface DadoBancarioEdit extends DadosBancariosDto {
	id?: number;
	isEditing?: boolean;
	isNew?: boolean;
}

type PessoaFormData = z.infer<typeof pessoaFormSchema>;

interface PessoaFormProps {
	initialData?: Partial<PessoaFormData>;
	initialTelefones?: TelefoneEdit[];
	initialDadosBancarios?: DadoBancarioEdit[];
	onSubmit: (
		data: PessoaFormData,
		telefones: TelefoneEdit[],
		dadosBancarios: DadoBancarioEdit[],
	) => void;
	onCancel: () => void;
	isLoading?: boolean;
	mode: "create" | "edit";
	onBuscarCep?: (cep: string) => void;
	onBuscarDocumento?: (documento: string) => void;
}

export function PessoaForm({
	initialData,
	initialTelefones = [],
	initialDadosBancarios = [],
	onSubmit,
	onCancel,
	isLoading,
	mode,
	onBuscarCep,
	onBuscarDocumento,
}: PessoaFormProps) {
	const [telefones, setTelefones] = useState<TelefoneEdit[]>(initialTelefones);
	const [dadosBancarios, setDadosBancarios] = useState<DadoBancarioEdit[]>(
		initialDadosBancarios,
	);

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
			observacoesGerais: initialData?.observacoesGerais || "",
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
		// Validar se há pelo menos um telefone
		if (telefones.length === 0) {
			alert("É necessário cadastrar pelo menos um telefone");
			return;
		}

		// Validar se há pelo menos um telefone principal
		const telefonePrincipal = telefones.filter(
			(t) => t.principal && !t.inativo,
		).length;
		if (telefonePrincipal === 0) {
			alert("É necessário ter pelo menos um telefone principal ativo");
			return;
		}

		// Converter "nao_informado" para undefined para o backend
		const submitData = {
			...data,
			sexo: data.sexo === "nao_informado" ? undefined : data.sexo,
		};

		onSubmit(submitData, telefones, dadosBancarios);
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
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							<Tabs defaultValue="basicos" className="space-y-6">
								<TabsList className="grid w-full grid-cols-5">
									<TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
									<TabsTrigger value="endereco">Endereço</TabsTrigger>
									<TabsTrigger value="telefones">Telefones</TabsTrigger>
									<TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
									<TabsTrigger value="observacoes">Observações</TabsTrigger>
								</TabsList>

								{/* Aba Dados Básicos */}
								<TabsContent value="basicos" className="space-y-6">
									<div className="space-y-4">
										<FormField
											control={form.control}
											name="tipoPessoa"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Tipo de Pessoa</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecione o tipo" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="fisica">
																Pessoa Física
															</SelectItem>
															<SelectItem value="juridica">
																Pessoa Jurídica
															</SelectItem>
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
																	tipoPessoa === "fisica"
																		? "000.000.000-00"
																		: "00.000.000/0000-00"
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
														{tipoPessoa === "fisica"
															? "Nome Completo"
															: "Razão Social"}
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
															{tipoPessoa === "fisica"
																? "Data de Nascimento"
																: "Data de Fundação"}
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
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Selecione" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="nao_informado">
																		Não informado
																	</SelectItem>
																	<SelectItem value="masculino">
																		Masculino
																	</SelectItem>
																	<SelectItem value="feminino">
																		Feminino
																	</SelectItem>
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
								</TabsContent>

								{/* Aba Endereço */}
								<TabsContent value="endereco" className="space-y-6">
									<div className="space-y-4">
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
								</TabsContent>

								{/* Aba Telefones */}
								<TabsContent value="telefones" className="space-y-6">
									<TelefonesTable
										telefones={telefones}
										onChange={setTelefones}
										isLoading={isLoading}
									/>
								</TabsContent>

								{/* Aba Dados Bancários */}
								<TabsContent value="bancarios" className="space-y-6">
									<DadosBancariosTable
										dadosBancarios={dadosBancarios}
										onChange={setDadosBancarios}
										isLoading={isLoading}
									/>
								</TabsContent>

								{/* Aba Observações */}
								<TabsContent value="observacoes" className="space-y-6">
									<div className="space-y-4">
										<FormField
											control={form.control}
											name="observacoesGerais"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Observações</FormLabel>
													<FormControl>
														<Textarea {...field} rows={6} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</TabsContent>
							</Tabs>

							<div className="flex justify-end gap-4 pt-4 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									disabled={isLoading}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading
										? "Salvando..."
										: mode === "create"
											? "Criar"
											: "Salvar"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
