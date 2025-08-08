import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { TelefoneDto } from "@/modules/factoring/dtos/pessoas";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface TelefoneEdit extends TelefoneDto {
	id?: number;
	isEditing?: boolean;
	isNew?: boolean;
}

interface TelefonesTableProps {
	telefones: TelefoneEdit[];
	onChange: (telefones: TelefoneEdit[]) => void;
	isLoading?: boolean;
}

export function TelefonesTable({
	telefones,
	onChange,
	isLoading,
}: TelefonesTableProps) {
	const [editingId, setEditingId] = useState<number | string | null>(null);

	const handleAdd = () => {
		const newTelefone: TelefoneEdit = {
			numero: "",
			principal: telefones.length === 0, // Primeiro telefone é principal por padrão
			whatsapp: false,
			inativo: false,
			isEditing: true,
			isNew: true,
			id: Date.now(), // ID temporário
		};

		onChange([...telefones, newTelefone]);
		setEditingId(newTelefone.id!);
	};

	const handleEdit = (index: number) => {
		const telefone = telefones[index];
		setEditingId(telefone.id || index);

		const updatedTelefones = [...telefones];
		updatedTelefones[index] = { ...telefone, isEditing: true };
		onChange(updatedTelefones);
	};

	const handleSave = (index: number) => {
		const telefone = telefones[index];

		// Validação básica
		if (!telefone.numero || telefone.numero.length < 10) {
			alert("Telefone deve ter pelo menos 10 dígitos");
			return;
		}

		// Se este telefone foi marcado como principal, desmarcar outros
		if (telefone.principal) {
			const updatedTelefones = telefones.map((t, i) => ({
				...t,
				principal: i === index,
			}));
			updatedTelefones[index] = {
				...telefone,
				isEditing: false,
				isNew: false,
			};
			onChange(updatedTelefones);
		} else {
			const updatedTelefones = [...telefones];
			updatedTelefones[index] = {
				...telefone,
				isEditing: false,
				isNew: false,
			};
			onChange(updatedTelefones);
		}

		setEditingId(null);
	};

	const handleCancel = (index: number) => {
		const telefone = telefones[index];

		if (telefone.isNew) {
			// Remove telefone novo se cancelar
			const updatedTelefones = telefones.filter((_, i) => i !== index);
			onChange(updatedTelefones);
		} else {
			// Restaura estado original
			const updatedTelefones = [...telefones];
			updatedTelefones[index] = { ...telefone, isEditing: false };
			onChange(updatedTelefones);
		}

		setEditingId(null);
	};

	const handleDelete = (index: number) => {
		if (confirm("Tem certeza que deseja excluir este telefone?")) {
			const updatedTelefones = telefones.filter((_, i) => i !== index);
			onChange(updatedTelefones);
		}
	};

	const handleFieldChange = (
		index: number,
		field: keyof TelefoneDto,
		value: any,
	) => {
		const updatedTelefones = [...telefones];
		updatedTelefones[index] = {
			...updatedTelefones[index],
			[field]: value,
		};
		onChange(updatedTelefones);
	};

	const formatPhone = (phone: string) => {
		const digits = phone.replace(/\D/g, "");
		if (digits.length === 11) {
			return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
		} else if (digits.length === 10) {
			return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
		}
		return phone;
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
				<h4 className="font-medium">Telefones</h4>
				<Button onClick={handleAdd} size="sm" disabled={editingId !== null}>
					<Plus className="h-4 w-4 mr-2" />
					Adicionar Telefone
				</Button>
			</div>

			{telefones.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					Nenhum telefone cadastrado
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Principal</TableHead>
								<TableHead>WhatsApp</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{telefones.map((telefone, index) => (
								<TableRow key={telefone.id || index}>
									<TableCell>
										{telefone.isEditing ? (
											<Input
												value={telefone.numero}
												onChange={(e) =>
													handleFieldChange(index, "numero", e.target.value)
												}
												placeholder="(11) 99999-9999"
												className="w-full"
											/>
										) : (
											<span className="font-mono">
												{formatPhone(telefone.numero)}
											</span>
										)}
									</TableCell>

									<TableCell>
										{telefone.isEditing ? (
											<Switch
												checked={telefone.principal}
												onCheckedChange={(checked) =>
													handleFieldChange(index, "principal", checked)
												}
											/>
										) : telefone.principal ? (
											<Badge variant="default">Principal</Badge>
										) : (
											"-"
										)}
									</TableCell>

									<TableCell>
										{telefone.isEditing ? (
											<Switch
												checked={telefone.whatsapp}
												onCheckedChange={(checked) =>
													handleFieldChange(index, "whatsapp", checked)
												}
											/>
										) : telefone.whatsapp ? (
											<Badge variant="secondary">WhatsApp</Badge>
										) : (
											"-"
										)}
									</TableCell>

									<TableCell>
										{telefone.isEditing ? (
											<div className="flex items-center gap-2">
												<Switch
													checked={!telefone.inativo}
													onCheckedChange={(checked) =>
														handleFieldChange(index, "inativo", !checked)
													}
												/>
												<span className="text-sm">
													{telefone.inativo ? "Inativo" : "Ativo"}
												</span>
											</div>
										) : (
											<Badge
												variant={telefone.inativo ? "destructive" : "default"}
											>
												{telefone.inativo ? "Inativo" : "Ativo"}
											</Badge>
										)}
									</TableCell>

									<TableCell className="text-right">
										{telefone.isEditing ? (
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
