import { useState } from "react";
import { Plus, Eye, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { TablePagination } from "@/components/tables/TablePagination";
import { CreateJournalEntryModal } from "../modals/CreateJournalEntryModal";
import { JournalEntryDetailModal } from "../modals/JournalEntryDetailModal";
import { DeleteJournalEntryModal } from "../modals/DeleteJournalEntryModal";
import { JournalStatusBadge } from "../components/JournalStatusBadge";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { useUpdateJournalEntry } from "../hooks/useJournalEntryMutations";
import { usePagination } from "@/hooks/usePagination";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  JournalEntry,
  JournalEntryQueryParams,
  JournalStatus,
} from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';

export default function JournalEntriesPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { can } = usePermissions();

  const [filters, setFilters] = useState<JournalEntryQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  const { data, isLoading } = useJournalEntries({ ...filters, page, limit });
  const anularMutation = useUpdateJournalEntry();

  const entries = data?.data ?? [];
  const pagination = data?.pagination;

// En la página JournalEntriesPage, línea 44-51, cambiar:
const handleAnular = async (id: string) => {
  try {
    await anularMutation.mutateAsync({ id, data: { status: "Anulado" } });
    setDetailEntry(null);
  } catch (error) {
    showToast.error(humanizeError(error)); // ← antes era "// handled by hook"
  }
};

  const columns: ColumnDef<JournalEntry>[] = [
    {
      header: "Comprobante",
      accessorKey: "voucherNumber",
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("es-HN"),
    },
    {
      header: "Concepto",
      accessorKey: "concept",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val.length > 50 ? `${val.slice(0, 50)}…` : val;
      },
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <JournalStatusBadge status={getValue() as JournalStatus} />
      ),
    },
    {
      header: "Creado por",
      accessorFn: (row) => row.createdByData?.username ?? "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDetailEntry(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {can("accounting:write") && row.original.status === "Valido" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleAnular(row.original._id)}
              disabled={anularMutation.isPending}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
          {can("accounting:write") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asientos Contables</h1>
        {can("accounting:write") && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Asiento
          </Button>
        )}
      </div>

      <TableToolbar>
        <div className="flex items-center gap-3">
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                status: v === "all" ? undefined : (v as JournalStatus),
              }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Valido">Válidos</SelectItem>
              <SelectItem value="Anulado">Anulados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={entries}
        loading={isLoading}
        emptyTitle="Sin asientos"
        emptyDescription="Aún no hay asientos contables registrados."
      />

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={setPerPage}
        />
      )}

      <CreateJournalEntryModal open={createOpen} onOpenChange={setCreateOpen} />

      {detailEntry && (
        <JournalEntryDetailModal
          open={!!detailEntry}
          onOpenChange={(open) => {
            if (!open) setDetailEntry(null);
          }}
          entry={detailEntry}
          canAnular={can("accounting:write") && detailEntry.status === "Valido"}
          onAnular={() => handleAnular(detailEntry._id)}
          isAnulando={anularMutation.isPending}
        />
      )}

      {deleteTarget && (
        <DeleteJournalEntryModal
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          entryId={deleteTarget._id}
          voucherNumber={deleteTarget.voucherNumber}
        />
      )}
    </div>
  );
}
