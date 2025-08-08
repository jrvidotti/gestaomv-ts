import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type ColumnFiltersState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";
import { DataTableHeader } from "./data-table-header";
import { DataTablePagination } from "./data-table-pagination";
import type { DataTableProps } from "./types";

export function DataTable<TData>({
	data,
	columns,
	isLoading = false,
	error = null,
	title,
	description,
	actions,
	filters = [],
	onFiltersChange,
	filterComponents,
	showClearFilters = false,
	onClearFilters,
	pagination,
	sorting: sortingProp,
	onRowClick,
	getRowId,
	emptyMessage = "Não há resultados.",
	className,
	tableClassName,
	manualPagination = true,
	manualSorting = true,
	manualFiltering = false,
}: DataTableProps<TData>) {
	// Converter sorting prop para formato TanStack
	const sorting: SortingState = sortingProp?.field
		? [
				{
					id: sortingProp.field,
					desc: sortingProp.direction === "desc",
				},
			]
		: [];

	const handleSortingChange = (
		updaterOrValue: SortingState | ((old: SortingState) => SortingState),
	) => {
		const newSorting =
			typeof updaterOrValue === "function"
				? updaterOrValue(sorting)
				: updaterOrValue;
		const firstSort = newSorting[0];

		if (sortingProp?.onSortingChange) {
			sortingProp.onSortingChange(
				firstSort?.id,
				firstSort ? (firstSort.desc ? "desc" : "asc") : undefined,
			);
		}
	};

	const handleFiltersChange = (
		updaterOrValue:
			| ColumnFiltersState
			| ((old: ColumnFiltersState) => ColumnFiltersState),
	) => {
		const newFilters =
			typeof updaterOrValue === "function"
				? updaterOrValue(filters)
				: updaterOrValue;

		if (onFiltersChange) {
			onFiltersChange(newFilters);
		}
	};

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters: filters,
		},
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: handleFiltersChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination,
		manualSorting,
		manualFiltering,
		pageCount: pagination
			? Math.ceil(pagination.totalCount / pagination.pageSize)
			: undefined,
		getRowId,
	});

	// Determinar se deve mostrar o loading state ou manter os dados
	const shouldShowLoadingState = isLoading && data.length === 0;
	const shouldShowOverlayLoader = isLoading && data.length > 0;

	return (
		<Card className={`${className} relative`}>
			<DataTableHeader
				title={title}
				description={description}
				isLoading={isLoading}
				totalCount={pagination?.totalCount}
				actions={actions}
				showClearFilters={showClearFilters}
				onClearFilters={onClearFilters}
			/>

			{/* Loader sobreposto discreto */}
			{shouldShowOverlayLoader && (
				<div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-md p-2 border shadow-sm">
					<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
				</div>
			)}

			<CardContent>
				{error ? (
					<div className="flex items-center justify-center py-8">
						<p className="text-destructive">
							Erro ao carregar dados: {error.message}
						</p>
					</div>
				) : shouldShowLoadingState ? (
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Carregando...</p>
					</div>
				) : (
					<>
						<Table className={tableClassName}>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												className={
													header.column.id === "actions" ? "w-[100px]" : ""
												}
											>
												{header.isPlaceholder ? null : (
													<div
														className={
															header.column.getCanSort()
																? "flex items-center gap-2 cursor-pointer select-none hover:text-foreground"
																: ""
														}
														onClick={header.column.getToggleSortingHandler()}
														onKeyDown={(e) => {
															if (e.key === "Enter" || e.key === " ") {
																header.column.getToggleSortingHandler()?.(e);
															}
														}}
														tabIndex={header.column.getCanSort() ? 0 : -1}
														role={
															header.column.getCanSort() ? "button" : undefined
														}
													>
														<div>
															{flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
														</div>
														{header.column.getCanSort() && (
															<div className="flex flex-col">
																{header.column.getIsSorted() === "asc" ? (
																	<ChevronUp className="h-4 w-4" />
																) : header.column.getIsSorted() === "desc" ? (
																	<ChevronDown className="h-4 w-4" />
																) : (
																	<ChevronsUpDown className="h-4 w-4 opacity-50" />
																)}
															</div>
														)}
													</div>
												)}
											</TableHead>
										))}
									</TableRow>
								))}

								{/* Linha de filtros */}
								{filterComponents &&
									Object.keys(filterComponents).length > 0 && (
										<TableRow>
											{table.getHeaderGroups()[0].headers.map((header) => (
												<TableHead key={`filter-${header.id}`} className="p-2">
													{filterComponents[header.column.id] || null}
												</TableHead>
											))}
										</TableRow>
									)}
							</TableHeader>

							<TableBody>
								{table.getRowModel().rows.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											className={
												onRowClick
													? "cursor-pointer hover:bg-muted/50"
													: undefined
											}
											onClick={() => {
												if (onRowClick) {
													onRowClick(row.original);
												}
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													onClick={(e) => {
														// Previne navegação quando clica em ações
														if (cell.column.id === "actions") {
															e.stopPropagation();
														}
													}}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											{emptyMessage}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>

						{/* Paginação */}
						{pagination &&
							(pagination.totalCount > 0 || table.getPageCount() > 1) && (
								<DataTablePagination
									page={pagination.page}
									pageSize={pagination.pageSize}
									totalPages={Math.ceil(
										pagination.totalCount / pagination.pageSize,
									)}
									totalCount={pagination.totalCount}
									onPageChange={pagination.onPageChange}
									onPageSizeChange={pagination.onPageSizeChange}
									pageSizeOptions={pagination.pageSizeOptions}
								/>
							)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
