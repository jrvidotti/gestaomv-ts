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
import { Edit, MoreHorizontal, Search, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

type Pessoa = {
  id: number;
  tipoPessoa: "fisica" | "juridica";
  documento: string;
  nomeRazaoSocial: string;
  nomeFantasia?: string | null;
  email?: string | null;
  criadoEm: string;
};

interface PessoasTableProps {
  data: Pessoa[];
  isLoading?: boolean;
  onDelete: (id: number) => void;
}

const columnHelper = createColumnHelper<Pessoa>();

export function PessoasTable({ data, isLoading, onDelete }: PessoasTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  const formatDocument = (documento: string, tipo: "fisica" | "juridica") => {
    if (tipo === "fisica") {
      // Formatar CPF: 123.456.789-01
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // Formatar CNPJ: 12.345.678/0001-90
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
  };

  const handleRowClick = (pessoa: Pessoa, event: React.MouseEvent) => {
    // Evitar navegação se o clique for na coluna de ações
    if ((event.target as HTMLElement).closest('[data-actions]')) {
      return;
    }
    
    navigate({
      to: "/admin/factoring/pessoas/$id",
      params: { id: pessoa.id.toString() }
    });
  };

  const columns = [
    columnHelper.accessor("tipoPessoa", {
      header: "Tipo",
      cell: (info) => (
        <Badge variant={info.getValue() === "fisica" ? "default" : "secondary"}>
          {info.getValue() === "fisica" ? "PF" : "PJ"}
        </Badge>
      ),
    }),
    columnHelper.accessor("documento", {
      header: "Documento",
      cell: (info) => (
        <div className="font-mono text-sm">
          {formatDocument(info.getValue(), info.row.original.tipoPessoa)}
        </div>
      ),
    }),
    columnHelper.accessor("nomeRazaoSocial", {
      header: "Nome/Razão Social",
      cell: (info) => (
        <div className="font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("nomeFantasia", {
      header: "Nome Fantasia",
      cell: (info) => {
        const fantasia = info.getValue();
        return fantasia ? (
          <div className="text-sm">{fantasia}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    }),
    columnHelper.accessor("email", {
      header: "E-mail",
      cell: (info) => {
        const email = info.getValue();
        return email ? (
          <div className="text-sm">{email}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    }),
    columnHelper.accessor("criadoEm", {
      header: "Criado em",
      cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Ações",
      cell: (info) => (
        <div data-actions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/factoring/pessoas/$id"
                  params={{ id: info.row.original.id.toString() }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/factoring/pessoas/$id/editar"
                  params={{ id: info.row.original.id.toString() }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(info.row.original.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            placeholder="Buscar pessoas..."
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
                <TableRow 
                  key={row.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(event) => handleRowClick(row.original, event)}
                >
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
                    ? "Nenhuma pessoa encontrada para a busca"
                    : "Nenhuma pessoa cadastrada"}
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
            de {table.getFilteredRowModel().rows.length} pessoas
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