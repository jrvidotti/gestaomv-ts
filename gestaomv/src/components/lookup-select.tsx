"use client";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Option {
	value: string;
	label: string;
}

interface LookSelectProps {
	value?: string | null;
	onValueChange: (value: string | null) => void;
	options: Option[];
	placeholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	className?: string;
	required?: boolean;
}

export function LookupSelect({
	value,
	onValueChange,
	options,
	placeholder = "Selecione um item",
	emptyMessage = "Nenhum item selecionado",
	disabled = false,
	className,
	required = false,
}: LookSelectProps) {
	const selectValue = value ?? "none";
	const hasValue = value !== "none";

	const handleClear = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onValueChange(null);
	};

	const handleSelectChange = (newValue: string) => {
		if (newValue === "" || newValue === value) {
			return;
		}

		onValueChange(newValue === "none" ? null : newValue);
	};

	return (
		<div className={cn("relative", className)}>
			<Select
				onValueChange={handleSelectChange}
				value={selectValue}
				disabled={disabled}
			>
				<SelectTrigger
					className={cn("w-full", hasValue && !required && "pr-8")}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{!required && (
						<SelectItem value="none">
							<span className="text-muted-foreground">{emptyMessage}</span>
						</SelectItem>
					)}
					{options?.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{hasValue && !disabled && !required && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/80"
					onClick={handleClear}
					tabIndex={-1}
				>
					<X className="h-3 w-3" />
					<span className="sr-only">Limpar seleção</span>
				</Button>
			)}
		</div>
	);
}
