import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
	page: number;
	pageSize: number;
	totalPages: number;
	totalCount: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export function DataTablePagination({
	page,
	pageSize,
	totalPages,
	totalCount,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps) {
	const handlePreviousPage = () => {
		const novaPagina = Math.max(1, page - 1);
		onPageChange(novaPagina);
	};

	const handleNextPage = () => {
		const novaPagina = Math.min(totalPages, page + 1);
		onPageChange(novaPagina);
	};

	const handlePageSizeChange = (value: string) => {
		onPageSizeChange(Number(value));
	};

	return (
		<div className="flex items-center justify-between pt-4">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">
						Página {page} de {totalPages || 1}
					</p>
					<div className="text-sm text-muted-foreground">
						({totalCount} {totalCount === 1 ? "registro" : "registros"} no
						total)
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Itens por página:
					</span>
					<Select
						value={pageSize.toString()}
						onValueChange={handlePageSizeChange}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviousPage}
						disabled={page === 1}
					>
						Anterior
					</Button>
					<span className="text-sm text-muted-foreground px-2">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={page === totalPages}
					>
						Próxima
					</Button>
				</div>
			)}
		</div>
	);
}
