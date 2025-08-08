import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableSortingProps {
  field?: string;
  direction?: "asc" | "desc";
  onSortingChange: (field?: string, direction?: "asc" | "desc") => void;
}

export interface DataTableFilterProps {
  filters: ColumnFiltersState;
  onFiltersChange: (filters: ColumnFiltersState) => void;
  filterComponents?: Record<string, ReactNode>;
}

export interface DataTableProps<TData> {
  // Dados
  data: TData[];
  columns: ColumnDef<TData, any>[];

  // Estado
  isLoading?: boolean;
  error?: Error | null;

  // Header
  title?: string;
  description?: string;
  actions?: ReactNode[];

  // Filtros
  filters?: ColumnFiltersState;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  filterComponents?: Record<string, ReactNode>;
  showClearFilters?: boolean;
  onClearFilters?: () => void;

  // Paginação
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };

  // Ordenação
  sorting?: {
    field?: string;
    direction?: "asc" | "desc";
    onSortingChange: (field?: string, direction?: "asc" | "desc") => void;
  };

  // Comportamento
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;

  // Customização
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;

  // TanStack Table config
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
}

export interface UseDataTableOptions<TData> {
  data: TData[];
  totalCount: number;
  defaultPageSize?: number;
  defaultSorting?: {
    field?: string;
    direction?: "asc" | "desc";
  };
  syncWithUrl?: boolean;
  debounceMs?: number;
}

export interface UseDataTableReturn<TData> {
  // Estado
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;

  // Derivados
  totalPages: number;
  startIndex: number;
  endIndex: number;

  // Handlers
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSorting: (sorting: SortingState) => void;
  setFilters: (filters: ColumnFiltersState) => void;
  clearFilters: () => void;

  // Utils
  getTableProps: () => Partial<DataTableProps<TData>>;
}
