import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Search, Eye, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

type Operacao = {
  id: number;
  uid: string;
  clienteId: number;
  taxaJuros: number;
  valorLiquido: number | null;
  status: "rascunho" | "aprovacao" | "efetivada" | "liquidada" | "cancelada";
  dataAprovacao: string | null;
  dataPagamento: string | null;
  criadoEm: string;
  cliente: {
    pessoa: {
      nomeRazaoSocial: string;
      documento: string;
    };
  };
};

interface OperacoesTableProps {
  data: Operacao[];
  isLoading?: boolean;
  onCancel: (uid: string) => void;
}

const columnHelper = createColumnHelper<Operacao>();

const statusColors = {
  rascunho: "secondary",
  aprovacao: "outline",
  efetivada: "default",
  liquidada: "success",
  cancelada: "destructive",
} as const;

const statusLabels = {
  rascunho: "Rascunho",
  aprovacao: "Aprovação",
  efetivada: "Efetivada",
  liquidada: "Liquidada",
  cancelada: "Cancelada",
} as const;

export function OperacoesTable({ data, isLoading, onCancel }: OperacoesTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const columns = [
    columnHelper.accessor("uid", {
      header: "Protocolo",
      cell: (info) => (
        <div className="font-mono text-sm">{info.getValue()}</div>
      ),
    }),
    columnHelper.display({
      id: "cliente",
      header: "Cliente",
      cell: (info) => (
        <div>
          <div className="font-medium">
            {info.row.original.cliente.pessoa.nomeRazaoSocial}
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {info.row.original.cliente.pessoa.documento}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("taxaJuros", {
      header: "Taxa (%)",
      cell: (info) => `${info.getValue().toFixed(2)}%`,
    }),
    columnHelper.accessor("valorLiquido", {
      header: "Valor Líquido",
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {statusLabels[info.getValue()]}
        </Badge>
      ),
    }),
    columnHelper.accessor("criadoEm", {
      header: "Criado em",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to="/admin/factoring/operacoes/$uid"
                params={{ uid: info.row.original.uid }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Link>
            </DropdownMenuItem>
            {info.row.original.status === "rascunho" && (
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/factoring/operacoes/$uid/editar"
                  params={{ uid: info.row.original.uid }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
            )}
            {["rascunho", "aprovacao", "efetivada"].includes(info.row.original.status) && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onCancel(info.row.original.uid)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar operações..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {globalFilter 
                    ? "Nenhuma operação encontrada para a busca"
                    : "Nenhuma operação cadastrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} operações
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}