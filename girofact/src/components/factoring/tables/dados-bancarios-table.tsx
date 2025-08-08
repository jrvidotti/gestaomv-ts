import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { DadosBancariosDto } from "@/modules/factoring/dtos/pessoas";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface DadoBancarioEdit extends DadosBancariosDto {
	id?: number;
	isEditing?: boolean;
	isNew?: boolean;
}

interface DadosBancariosTableProps {
	dadosBancarios: DadoBancarioEdit[];
	onChange: (dadosBancarios: DadoBancarioEdit[]) => void;
	isLoading?: boolean;
}

export function DadosBancariosTable({
	dadosBancarios,
	onChange,
	isLoading,
}: DadosBancariosTableProps) {
	const [editingId, setEditingId] = useState<number | string | null>(null);

	const handleAdd = () => {
		const newDadoBancario: DadoBancarioEdit = {
			banco: "",
			agencia: "",
			conta: "",
			digitoVerificador: "",
			tipoConta: "corrente",
			isEditing: true,
			isNew: true,
			id: Date.now(), // ID temporário
		};

		onChange([...dadosBancarios, newDadoBancario]);
		setEditingId(newDadoBancario.id!);
	};

	const handleEdit = (index: number) => {
		const dadoBancario = dadosBancarios[index];
		setEditingId(dadoBancario.id || index);

		const updatedDados = [...dadosBancarios];
		updatedDados[index] = { ...dadoBancario, isEditing: true };
		onChange(updatedDados);
	};

	const handleSave = (index: number) => {
		const dadoBancario = dadosBancarios[index];

		// Validação básica
		if (!dadoBancario.banco || dadoBancario.banco.length < 3) {
			alert("Código do banco deve ter pelo menos 3 caracteres");
			return;
		}
		if (!dadoBancario.agencia || dadoBancario.agencia.length < 3) {
			alert("Agência deve ter pelo menos 3 caracteres");
			return;
		}
		if (!dadoBancario.conta) {
			alert("Conta é obrigatória");
			return;
		}
		if (!dadoBancario.digitoVerificador) {
			alert("Dígito verificador é obrigatório");
			return;
		}

		const updatedDados = [...dadosBancarios];
		updatedDados[index] = {
			...dadoBancario,
			isEditing: false,
			isNew: false,
		};
		onChange(updatedDados);
		setEditingId(null);
	};

	const handleCancel = (index: number) => {
		const dadoBancario = dadosBancarios[index];

		if (dadoBancario.isNew) {
			// Remove dado bancário novo se cancelar
			const updatedDados = dadosBancarios.filter((_, i) => i !== index);
			onChange(updatedDados);
		} else {
			// Restaura estado original
			const updatedDados = [...dadosBancarios];
			updatedDados[index] = { ...dadoBancario, isEditing: false };
			onChange(updatedDados);
		}

		setEditingId(null);
	};

	const handleDelete = (index: number) => {
		if (confirm("Tem certeza que deseja excluir estes dados bancários?")) {
			const updatedDados = dadosBancarios.filter((_, i) => i !== index);
			onChange(updatedDados);
		}
	};

	const handleFieldChange = (
		index: number,
		field: keyof DadosBancariosDto,
		value: any,
	) => {
		const updatedDados = [...dadosBancarios];
		updatedDados[index] = {
			...updatedDados[index],
			[field]: value,
		};
		onChange(updatedDados);
	};

	const formatBankAccount = (
		banco: string,
		agencia: string,
		conta: string,
		dv: string,
	) => {
		if (!banco || !agencia || !conta) return "";
		return `${banco} | Ag: ${agencia} | Cc: ${conta}-${dv}`;
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="h-12 bg-muted animate-pulse rounded" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h4 className="font-medium">Dados Bancários</h4>
				<Button onClick={handleAdd} size="sm" disabled={editingId !== null}>
					<Plus className="h-4 w-4 mr-2" />
					Adicionar Conta
				</Button>
			</div>

			{dadosBancarios.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					Nenhum dado bancário cadastrado
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Banco</TableHead>
								<TableHead>Agência</TableHead>
								<TableHead>Conta</TableHead>
								<TableHead>DV</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{dadosBancarios.map((dadoBancario, index) => (
								<TableRow key={dadoBancario.id || index}>
									<TableCell>
										{dadoBancario.isEditing ? (
											<Input
												value={dadoBancario.banco}
												onChange={(e) =>
													handleFieldChange(index, "banco", e.target.value)
												}
												placeholder="001"
												className="w-24"
											/>
										) : (
											<span className="font-mono">{dadoBancario.banco}</span>
										)}
									</TableCell>

									<TableCell>
										{dadoBancario.isEditing ? (
											<Input
												value={dadoBancario.agencia}
												onChange={(e) =>
													handleFieldChange(index, "agencia", e.target.value)
												}
												placeholder="1234"
												className="w-24"
											/>
										) : (
											<span className="font-mono">{dadoBancario.agencia}</span>
										)}
									</TableCell>

									<TableCell>
										{dadoBancario.isEditing ? (
											<Input
												value={dadoBancario.conta}
												onChange={(e) =>
													handleFieldChange(index, "conta", e.target.value)
												}
												placeholder="12345678"
												className="w-32"
											/>
										) : (
											<span className="font-mono">{dadoBancario.conta}</span>
										)}
									</TableCell>

									<TableCell>
										{dadoBancario.isEditing ? (
											<Input
												value={dadoBancario.digitoVerificador}
												onChange={(e) =>
													handleFieldChange(
														index,
														"digitoVerificador",
														e.target.value,
													)
												}
												placeholder="9"
												className="w-16"
												maxLength={2}
											/>
										) : (
											<span className="font-mono">
												{dadoBancario.digitoVerificador}
											</span>
										)}
									</TableCell>

									<TableCell>
										{dadoBancario.isEditing ? (
											<Select
												value={dadoBancario.tipoConta}
												onValueChange={(value: "corrente" | "poupanca") =>
													handleFieldChange(index, "tipoConta", value)
												}
											>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="corrente">Corrente</SelectItem>
													<SelectItem value="poupanca">Poupança</SelectItem>
												</SelectContent>
											</Select>
										) : (
											<Badge
												variant={
													dadoBancario.tipoConta === "corrente"
														? "default"
														: "secondary"
												}
											>
												{dadoBancario.tipoConta === "corrente"
													? "Corrente"
													: "Poupança"}
											</Badge>
										)}
									</TableCell>

									<TableCell className="text-right">
										{dadoBancario.isEditing ? (
											<div className="flex justify-end gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSave(index)}
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleCancel(index)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										) : (
											<div className="flex justify-end gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleEdit(index)}
													disabled={editingId !== null}
												>
													Editar
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(index)}
													disabled={editingId !== null}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
