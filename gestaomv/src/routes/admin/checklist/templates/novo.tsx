import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type TipoItemChecklist,
	periodicidadeSelectOptions,
} from "@/modules/checklist/enums";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/checklist/templates/novo")({
	component: NovoTemplatePage,
});

type ItemTemplate = {
	titulo: string;
	descricao: string;
	tipo: TipoItemChecklist;
	obrigatorio: boolean;
	peso: number;
	ordem: number;
};

function NovoTemplatePage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const header = (
		<PageHeader
			title="Novo Template de Checklist"
			subtitle="Configure um novo formulário de avaliação"
		/>
	);

	const [template, setTemplate] = useState({
		nome: "",
		descricao: "",
		periodicidade: "MENSAL" as const,
		ativo: true,
	});

	const [itens, setItens] = useState<(ItemTemplate & { id: string })[]>([
		{
			id: crypto.randomUUID(),
			titulo: "",
			descricao: "",
			tipo: "NOTA_1_5",
			obrigatorio: true,
			peso: 1,
			ordem: 1,
		},
	]);

	const { mutate: criarTemplate, isPending: isLoading } = useMutation({
		...trpc.checklist.templates.criar.mutationOptions(),
		onSuccess: () => {
			toast.success("Template criado com sucesso!");
			navigate({ to: "/admin/checklist/templates" });
		},
		onError: (error) => {
			toast.error(`Erro ao criar template: ${error.message}`);
		},
	});

	const adicionarItem = () => {
		setItens((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				titulo: "",
				descricao: "",
				tipo: "NOTA_1_5",
				obrigatorio: true,
				peso: 1,
				ordem: prev.length + 1,
			},
		]);
	};

	const removerItem = (index: number) => {
		if (itens.length > 1) {
			setItens((prev) =>
				prev
					.filter((_, i) => i !== index)
					.map((item, i) => ({ ...item, ordem: i + 1 })),
			);
		}
	};

	const atualizarItem = (
		index: number,
		campo: keyof ItemTemplate,
		valor: any,
	) => {
		setItens((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validação básica
		if (!template.nome.trim()) {
			alert("Nome do template é obrigatório");
			return;
		}

		if (itens.some((item) => !item.titulo.trim())) {
			alert("Todos os itens devem ter título");
			return;
		}

		criarTemplate({
			...template,
			itens: itens.map(({ id, ...item }) => ({
				...item,
				obrigatorio: item.obrigatorio,
			})),
		});
	};

	return (
		<AdminLayout header={header}>
			<div className="max-w-4xl mx-auto">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Informações Básicas */}
					<Card>
						<CardHeader>
							<CardTitle>Informações Básicas</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="nome">Nome do Template *</Label>
								<Input
									id="nome"
									value={template.nome}
									onChange={(e) =>
										setTemplate((prev) => ({ ...prev, nome: e.target.value }))
									}
									placeholder="Ex: Avaliação Mensal de Limpeza"
									required
								/>
							</div>

							<div>
								<Label htmlFor="descricao">Descrição</Label>
								<Textarea
									id="descricao"
									value={template.descricao}
									onChange={(e) =>
										setTemplate((prev) => ({
											...prev,
											descricao: e.target.value,
										}))
									}
									placeholder="Descreva o objetivo desta avaliação..."
								/>
							</div>

							<div>
								<Label htmlFor="periodicidade">Periodicidade *</Label>
								<Select
									value={template.periodicidade}
									onValueChange={(value: any) =>
										setTemplate((prev) => ({ ...prev, periodicidade: value }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a periodicidade" />
									</SelectTrigger>
									<SelectContent>
										{periodicidadeSelectOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Itens do Checklist */}
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle>Itens do Checklist</CardTitle>
								<Button type="button" onClick={adicionarItem} variant="outline">
									<Plus className="w-4 h-4 mr-2" />
									Adicionar Item
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{itens.map((item, index) => (
								<div key={item.id} className="border rounded-lg p-4 space-y-4">
									<div className="flex justify-between items-center">
										<h4 className="font-medium">Item {index + 1}</h4>
										{itens.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removerItem(index)}
											>
												<Minus className="w-4 h-4" />
											</Button>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>Título *</Label>
											<Input
												value={item.titulo}
												onChange={(e) =>
													atualizarItem(index, "titulo", e.target.value)
												}
												placeholder="Ex: Limpeza dos banheiros"
												required
											/>
										</div>

										<div>
											<Label>Tipo de Resposta</Label>
											<Select
												value={item.tipo}
												onValueChange={(value: any) =>
													atualizarItem(index, "tipo", value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o tipo" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="nota_1_5">
														Nota de 1 a 5
													</SelectItem>
													<SelectItem value="sim_nao">Sim/Não</SelectItem>
													<SelectItem value="texto">Texto Livre</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div>
										<Label>Descrição</Label>
										<Textarea
											value={item.descricao}
											onChange={(e) =>
												atualizarItem(index, "descricao", e.target.value)
											}
											placeholder="Detalhes sobre o que avaliar neste item..."
										/>
									</div>

									<div className="flex gap-4">
										<div>
											<Label>Peso</Label>
											<Input
												type="number"
												min="0.1"
												max="10"
												step="0.1"
												value={item.peso}
												onChange={(e) =>
													atualizarItem(index, "peso", Number(e.target.value))
												}
												className="w-24"
											/>
										</div>

										<div className="flex items-center space-x-2 pt-6">
											<input
												type="checkbox"
												id={`obrigatorio-${index}`}
												checked={item.obrigatorio}
												onChange={(e) =>
													atualizarItem(index, "obrigatorio", e.target.checked)
												}
											/>
											<Label htmlFor={`obrigatorio-${index}`}>
												Item obrigatório
											</Label>
										</div>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Ações */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/admin/checklist/templates" })}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Criando..." : "Criar Template"}
						</Button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
}
