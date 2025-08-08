import { useNavigate } from "@tanstack/react-router";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import type {
	DataTableProps,
	UseDataTableOptions,
	UseDataTableReturn,
} from "./types";

interface UseDataTableProps<TData> extends UseDataTableOptions<TData> {
	// Estados atuais (normalmente vêm da URL via search params)
	currentPage: number;
	currentPageSize: number;
	currentSortField?: string;
	currentSortDirection?: "asc" | "desc";
	currentFilters?: ColumnFiltersState;

	// Navegação
	navigateTo?: string;
	searchParamMapping?: {
		page?: string;
		pageSize?: string;
		sortField?: string;
		sortDirection?: string;
	};
}

export function useDataTable<TData>({
	data,
	totalCount,
	currentPage,
	currentPageSize,
	currentSortField,
	currentSortDirection,
	currentFilters = [],
	defaultPageSize = 10,
	navigateTo,
	searchParamMapping = {
		page: "pagina",
		pageSize: "limite",
		sortField: "sortField",
		sortDirection: "sortDirection",
	},
}: UseDataTableProps<TData>): UseDataTableReturn<TData> {
	const navigate = useNavigate();

	// Valores derivados
	const totalPages = Math.ceil(totalCount / currentPageSize);
	const startIndex = (currentPage - 1) * currentPageSize + 1;
	const endIndex = Math.min(currentPage * currentPageSize, totalCount);

	// Converter para formato TanStack
	const sorting: SortingState = currentSortField
		? [
				{
					id: currentSortField,
					desc: currentSortDirection === "desc",
				},
			]
		: [];

	// Handler para mudança de página
	const setPage = useCallback(
		(page: number) => {
			if (!navigateTo) return;

			navigate({
				to: navigateTo as any,
				search: (prev: any) => ({
					...prev,
					[searchParamMapping.page || "pagina"]: page,
				}),
			});
		},
		[navigate, navigateTo, searchParamMapping.page],
	);

	// Handler para mudança de tamanho da página
	const setPageSize = useCallback(
		(pageSize: number) => {
			if (!navigateTo) return;

			navigate({
				to: navigateTo as any,
				search: (prev: any) => ({
					...prev,
					[searchParamMapping.pageSize || "limite"]: pageSize,
					[searchParamMapping.page || "pagina"]: 1, // Reset para primeira página
				}),
			});
		},
		[
			navigate,
			navigateTo,
			searchParamMapping.pageSize,
			searchParamMapping.page,
		],
	);

	// Handler para mudança de ordenação
	const setSorting = useCallback(
		(newSorting: SortingState) => {
			if (!navigateTo) return;

			const firstSort = newSorting[0];
			navigate({
				to: navigateTo as any,
				search: (prev: any) => ({
					...prev,
					[searchParamMapping.sortField || "sortField"]:
						firstSort?.id || undefined,
					[searchParamMapping.sortDirection || "sortDirection"]: firstSort
						? firstSort.desc
							? "desc"
							: "asc"
						: undefined,
					[searchParamMapping.page || "pagina"]: 1, // Reset para primeira página
				}),
			});
		},
		[
			navigate,
			navigateTo,
			searchParamMapping.sortField,
			searchParamMapping.sortDirection,
			searchParamMapping.page,
		],
	);

	// Handler para ordenação (compatibilidade com DataTable)
	const handleSortingChange = useCallback(
		(field?: string, direction?: "asc" | "desc") => {
			if (!navigateTo) return;

			navigate({
				to: navigateTo as any,
				search: (prev: any) => ({
					...prev,
					[searchParamMapping.sortField || "sortField"]: field,
					[searchParamMapping.sortDirection || "sortDirection"]: direction,
					[searchParamMapping.page || "pagina"]: 1,
				}),
			});
		},
		[navigate, navigateTo, searchParamMapping],
	);

	// Handler para mudança de filtros (simplificado - cada implementação pode customizar)
	const setFilters = useCallback((filters: ColumnFiltersState) => {
		// Esta é uma implementação básica
		// Cada página pode ter sua própria lógica de filtros via URL
		console.log("Filters changed:", filters);
	}, []);

	// Handler para limpar filtros
	const clearFilters = useCallback(() => {
		if (!navigateTo) return;

		navigate({
			to: navigateTo as any,
			search: {
				[searchParamMapping.page || "pagina"]: 1,
				[searchParamMapping.pageSize || "limite"]: defaultPageSize,
			},
		});
	}, [navigate, navigateTo, searchParamMapping, defaultPageSize]);

	// Gerar props para DataTable
	const getTableProps = useCallback((): Partial<DataTableProps<TData>> => {
		return {
			data,
			pagination: {
				page: currentPage,
				pageSize: currentPageSize,
				totalCount,
				onPageChange: setPage,
				onPageSizeChange: setPageSize,
			},
			sorting: {
				field: currentSortField,
				direction: currentSortDirection,
				onSortingChange: handleSortingChange,
			},
			filters: currentFilters,
			onFiltersChange: setFilters,
			showClearFilters: true,
			onClearFilters: clearFilters,
		};
	}, [
		data,
		currentPage,
		currentPageSize,
		totalCount,
		currentSortField,
		currentSortDirection,
		currentFilters,
		setPage,
		setPageSize,
		handleSortingChange,
		setFilters,
		clearFilters,
	]);

	return {
		// Estado
		page: currentPage,
		pageSize: currentPageSize,
		sorting,
		filters: currentFilters,

		// Derivados
		totalPages,
		startIndex,
		endIndex,

		// Handlers
		setPage,
		setPageSize,
		setSorting,
		setFilters,
		clearFilters,

		// Utils
		getTableProps,
	};
}
