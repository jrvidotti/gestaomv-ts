import { DataSelectionDialog } from "@/components/factoring/forms/data-selection-dialog";
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
import { MaskedInput } from "@/components/ui/masked-input";
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
	dataNascimentoFundacao: z.string().optional().or(z.literal("")),
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
	onBuscarDocumento?: (
		documento: string,
		onSuccess?: (dados: any) => void,
	) => void;
	isLoadingBusca?: boolean;
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
	isLoadingBusca,
}: PessoaFormProps) {
	const [telefones, setTelefones] = useState<TelefoneEdit[]>(initialTelefones);
	const [dadosBancarios, setDadosBancarios] = useState<DadoBancarioEdit[]>(
		initialDadosBancarios,
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dadosConsulta, setDadosConsulta] = useState<any>(null);

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

		// Converter "nao_informado" para undefined e data vazia para undefined
		const submitData = {
			...data,
			sexo: data.sexo === "nao_informado" ? undefined : data.sexo,
			dataNascimentoFundacao:
				data.dataNascimentoFundacao === ""
					? undefined
					: data.dataNascimentoFundacao,
		};

		onSubmit(submitData, telefones, dadosBancarios);
	};

	const handleBuscarDocumento = () => {
		const documento = form.getValues("documento");
		if (documento && onBuscarDocumento) {
			onBuscarDocumento(documento, (dados) => {
				// Preencher automaticamente dados pessoais básicos
				const dadosBasicos: any = {
					tipoPessoa: dados.tipoPessoa || form.getValues("tipoPessoa"),
					documento: dados.documento || documento,
					nomeRazaoSocial: dados.nomeRazaoSocial || "",
				};

				// Adicionar campos específicos baseados no tipo de pessoa
				if (dados.tipoPessoa === "fisica") {
					if (dados.dataNascimentoFundacao) {
						dadosBasicos.dataNascimentoFundacao = dados.dataNascimentoFundacao
							.toISOString()
							.split("T")[0];
					}
					if (dados.sexo) {
						dadosBasicos.sexo = dados.sexo;
					}
					if (dados.nomeMae) {
						dadosBasicos.nomeMae = dados.nomeMae;
					}
				} else if (dados.tipoPessoa === "juridica") {
					if (dados.nomeFantasia) {
						dadosBasicos.nomeFantasia = dados.nomeFantasia;
					}
					if (dados.dataNascimentoFundacao) {
						dadosBasicos.dataNascimentoFundacao = dados.dataNascimentoFundacao
							.toISOString()
							.split("T")[0];
					}
					if (dados.inscricaoEstadual) {
						dadosBasicos.inscricaoEstadual = dados.inscricaoEstadual;
					}
					if (dados.inscricaoMunicipal) {
						dadosBasicos.inscricaoMunicipal = dados.inscricaoMunicipal;
					}
				}

				// Aplicar dados básicos ao formulário
				form.reset({
					...form.getValues(),
					...dadosBasicos,
				});

				// Preparar dados complementares para o dialog
				const dadosComplementares = {
					enderecos:
						dados.cep || dados.logradouro || dados.cidade
							? [
									{
										cep: dados.cep,
										logradouro: dados.logradouro,
										numero: dados.numero,
										complemento: dados.complemento,
										bairro: dados.bairro,
										cidade: dados.cidade,
										estado: dados.estado,
									},
								]
							: undefined,
					emails: dados.email ? [dados.email] : undefined,
					telefones: dados.telefones?.length > 0 ? dados.telefones : undefined,
				};

				// Verificar se há dados complementares para mostrar no dialog
				if (
					dadosComplementares.enderecos ||
					dadosComplementares.emails ||
					dadosComplementares.telefones
				) {
					setDadosConsulta(dadosComplementares);
					setDialogOpen(true);
				}
			});
		}
	};

	const handleBuscarCep = () => {
		const cep = form.getValues("cep");
		if (cep && onBuscarCep) {
			onBuscarCep(cep);
		}
	};

	const handleDocumentoKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			event.preventDefault();
			
			// Verificar se é cadastro novo e nome está vazio
			const nomeRazaoSocial = form.getValues("nomeRazaoSocial");
			const isNomeVazio = !nomeRazaoSocial || nomeRazaoSocial.trim() === "";
			
			if (mode === "create" && isNomeVazio) {
				handleBuscarDocumento();
			}
		}
	};

	const handleImportSelectedData = (selecoes: {
		enderecoIndex?: number;
		emailIndex?: number;
		telefoneIndices?: number[];
	}) => {
		if (!dadosConsulta) return;

		const currentValues = form.getValues();
		const updateData: any = { ...currentValues };

		// Importar dados de endereço se selecionado
		if (selecoes.enderecoIndex !== undefined && dadosConsulta.enderecos) {
			const endereco = dadosConsulta.enderecos[selecoes.enderecoIndex];
			if (endereco) {
				if (endereco.cep) updateData.cep = endereco.cep;
				if (endereco.logradouro) updateData.logradouro = endereco.logradouro;
				if (endereco.numero) updateData.numero = endereco.numero;
				if (endereco.complemento) updateData.complemento = endereco.complemento;
				if (endereco.bairro) updateData.bairro = endereco.bairro;
				if (endereco.cidade) updateData.cidade = endereco.cidade;
				if (endereco.estado) updateData.estado = endereco.estado;
			}
		}

		// Importar email se selecionado
		if (selecoes.emailIndex !== undefined && dadosConsulta.emails) {
			const email = dadosConsulta.emails[selecoes.emailIndex];
			if (email) {
				updateData.email = email;
			}
		}

		// Aplicar atualizações ao formulário
		form.reset(updateData);

		// Importar telefones se selecionado
		if (
			selecoes.telefoneIndices &&
			selecoes.telefoneIndices.length > 0 &&
			dadosConsulta.telefones
		) {
			const telefonesParaImportar = selecoes.telefoneIndices
				.map((index) => dadosConsulta.telefones![index])
				.filter(Boolean);
			setTelefones((prev) => [...prev, ...telefonesParaImportar]);
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
										<div className="flex gap-4 items-end">
											<FormField
												control={form.control}
												name="tipoPessoa"
												render={({ field }) => (
													<FormItem className="flex-1">
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

											<FormField
												control={form.control}
												name="documento"
												render={({ field }) => (
													<FormItem className="flex-1">
														<FormLabel>
															{tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
														</FormLabel>
														<FormControl>
															<div className="relative">
																<MaskedInput
																	name={field.name}
																	value={field.value}
																	onChange={field.onChange}
																	onBlur={field.onBlur}
																	onKeyDown={handleDocumentoKeyDown}
																	mask={
																		tipoPessoa === "fisica"
																			? "000.000.000-00"
																			: "00.000.000/0000-00"
																	}
																	placeholder={
																		tipoPessoa === "fisica"
																			? "000.000.000-00"
																			: "00.000.000/0000-00"
																	}
																	className="pr-20"
																/>
																{onBuscarDocumento && (
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={handleBuscarDocumento}
																		className="absolute right-1 top-1 h-8 px-3"
																		disabled={isLoadingBusca}
																	>
																		{isLoadingBusca ? "Buscando..." : "Buscar"}
																	</Button>
																)}
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
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

			{/* Dialog de Seleção de Dados */}
			<DataSelectionDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				dadosEncontrados={dadosConsulta || {}}
				onImportSelected={handleImportSelectedData}
			/>
		</div>
	);
}
