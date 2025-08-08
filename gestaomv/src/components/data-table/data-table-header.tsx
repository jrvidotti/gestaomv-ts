import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface DataTableHeaderProps {
	title?: string;
	description?: string;
	isLoading?: boolean;
	totalCount?: number;
	actions?: ReactNode[];
	showClearFilters?: boolean;
	onClearFilters?: () => void;
}

export function DataTableHeader({
	title,
	description,
	isLoading = false,
	totalCount,
	actions,
	showClearFilters = false,
	onClearFilters,
}: DataTableHeaderProps) {
	if (!title && !description && !actions?.length && !showClearFilters) {
		return null;
	}

	const getDescriptionText = () => {
		if (isLoading) {
			return "Carregando...";
		}

		if (typeof totalCount === "number") {
			const baseText = description || "";
			const countText = `${totalCount} ${totalCount === 1 ? "registro encontrado" : "registros encontrados"}`;
			return baseText ? `${baseText} - ${countText}` : countText;
		}

		return description;
	};

	return (
		<CardHeader>
			<div className="flex items-center justify-between">
				<div>
					{title && <CardTitle>{title}</CardTitle>}
					{(description || typeof totalCount === "number") && (
						<CardDescription>{getDescriptionText()}</CardDescription>
					)}
				</div>

				{(actions?.length || showClearFilters) && (
					<div className="flex items-center gap-2">
						{showClearFilters && onClearFilters && (
							<Button variant="outline" onClick={onClearFilters}>
								Limpar Filtros
							</Button>
						)}
						{actions}
					</div>
				)}
			</div>
		</CardHeader>
	);
}
