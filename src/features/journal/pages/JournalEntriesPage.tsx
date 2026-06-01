import { useState, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, Ban, ArrowUpRight, ArrowDownRight, Wallet, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { Card, CardContent } from '@/components/ui/card';
import { CreateJournalEntryModal } from '../modals/CreateJournalEntryModal';
import { EditJournalEntryModal } from '../modals/EditJournalEntryModal';
import { JournalEntryDetailModal } from '../modals/JournalEntryDetailModal';
import { DeleteJournalEntryModal } from '../modals/DeleteJournalEntryModal';
import { JournalStatusBadge } from '../components/JournalStatusBadge';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useUpdateJournalEntry } from '../hooks/useJournalEntryMutations';
import { usePagination } from '@/hooks/usePagination';
import { usePermissions } from '@/hooks/usePermissions';
import type {
  JournalEntry,
  JournalEntryQueryParams,
  JournalType,
  JournalStatus,
} from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';

const TYPE_STYLES: Record<JournalType, string> = {
  Ingreso: 'bg-green-100 text-green-800',
  Egreso: 'bg-red-100 text-red-800',
};

export default function JournalEntriesPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { can } = usePermissions();

  const [filters, setFilters] = useState<JournalEntryQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  const { data, isLoading } = useJournalEntries({ ...filters, page, limit });
  const { data: allData } = useJournalEntries({ ...filters, limit: 1000 });
  const anularMutation = useUpdateJournalEntry();

  const entries = data?.data ?? [];
  const pagination = data?.pagination;
  const allEntries = allData?.data ?? [];

  // ── Calcular resumen (ingresos, egresos, saldo) ── usando TODOS los datos
  const summary = useMemo(() => {
    const validEntries = allEntries.filter((e) => e.status === 'Valido');
    const ingresos = validEntries
      .filter((e) => e.type === 'Ingreso')
      .reduce((s, e) => s + e.amount, 0);
    const egresos = validEntries
      .filter((e) => e.type === 'Egreso')
      .reduce((s, e) => s + e.amount, 0);
    return { ingresos, egresos, saldo: ingresos - egresos };
  }, [allEntries]);

  // ── Calcular saldo acumulado por fila ── usando TODOS los datos
  const entriesWithBalance = useMemo(() => {
    if (allEntries.length === 0) return entries;

    const sortedAll = [...allEntries]
      .sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.voucherNumber.localeCompare(b.voucherNumber);
      });

    let running = 0;
    const balanceMap = new Map<string, number>();
    for (const e of sortedAll) {
      if (e.status === 'Valido') {
        running += e.type === 'Ingreso' ? e.amount : -e.amount;
      }
      balanceMap.set(e._id, running);
    }

    return entries.map((e) => ({
      ...e,
      runningBalance: e.status === 'Anulado' ? undefined : balanceMap.get(e._id),
    }));
  }, [entries, allEntries]);

  const handleAnular = async (id: string) => {
    try {
      await anularMutation.mutateAsync({ id, data: { status: 'Anulado' } });
      setDetailEntry(null);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  const columns: ColumnDef<(typeof entriesWithBalance)[number]>[] = [
    {
      header: 'Comprobante',
      accessorKey: 'voucherNumber',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue() as string}</span>
      ),
    },
    {
      header: 'Fecha',
      accessorKey: 'date',
      cell: ({ getValue }) =>
        new Date(getValue() as string).toISOString().slice(0, 10).split('-').reverse().join('/'),
    },
    {
      header: 'Tipo',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const type = getValue() as JournalType;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium',
              TYPE_STYLES[type],
            )}
          >
            {type === 'Ingreso' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {type}
          </span>
        );
      },
    },
    {
      header: 'Concepto',
      accessorKey: 'concept',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span title={val}>
            {val.length > 40 ? `${val.slice(0, 40)}…` : val}
          </span>
        );
      },
    },
    {
      header: 'Cuenta',
      accessorFn: (row) => row.accountData?.name ?? '—',
    },
    {
      header: 'Monto',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <span
          className={cn(
            'font-mono tabular-nums font-semibold text-sm',
            row.original.type === 'Ingreso'
              ? 'text-green-600'
              : 'text-red-600',
          )}
        >
          {row.original.type === 'Ingreso' ? '+' : '−'} L.{' '}
          {row.original.amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Saldo',
      id: 'runningBalance',
      cell: ({ row }) => {
        if (row.original.status === 'Anulado') {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        const bal = row.original.runningBalance;
        if (bal === undefined || bal === null) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <span
            className={cn(
              'font-mono tabular-nums font-bold text-sm',
              bal >= 0 ? 'text-green-700' : 'text-red-700',
            )}
          >
            L. {bal.toFixed(2)}
          </span>
        );
      },
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <JournalStatusBadge status={getValue() as JournalStatus} />
      ),
    },
    {
      header: 'Creado por',
      accessorFn: (row) => row.createdByData?.username ?? '—',
    },
    {
      id: 'actions',
      header: '',
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
          {can('accounting:write') && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditEntry(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can('accounting:write') && row.original.status === 'Valido' && (
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
          {can('accounting:write') && (
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
      {/* ── Título y botón ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Libro Diario</h1>
        {can('accounting:write') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Asiento
          </Button>
        )}
      </div>

      {/* ── Resumen: tarjetas de ingresos, egresos, saldo ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Ingresos
              </p>
              <p className="text-xl font-bold text-green-600 tabular-nums">
                L. {summary.ingresos.toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Egresos
              </p>
              <p className="text-xl font-bold text-red-600 tabular-nums">
                L. {summary.egresos.toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-2">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-l-4',
            summary.saldo >= 0
              ? 'border-l-green-500'
              : 'border-l-red-500',
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Saldo
              </p>
              <p
                className={cn(
                  'text-xl font-bold tabular-nums',
                  summary.saldo >= 0 ? 'text-green-600' : 'text-red-600',
                )}
              >
                L. {summary.saldo.toFixed(2)}
              </p>
            </div>
            <div
              className={cn(
                'rounded-full p-2',
                summary.saldo >= 0 ? 'bg-green-100' : 'bg-red-100',
              )}
            >
              <Wallet
                className={cn(
                  'h-5 w-5',
                  summary.saldo >= 0 ? 'text-green-600' : 'text-red-600',
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filtros ────────────────────────────────────── */}
      <TableToolbar>
        <div className="flex items-center gap-3">
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                type: v === 'all' ? undefined : (v as JournalType),
              }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ingreso">Ingresos</SelectItem>
              <SelectItem value="Egreso">Egresos</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                status: v === 'all' ? undefined : (v as JournalStatus),
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
          <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Limpiar
          </Button>
        </div>
      </TableToolbar>

      {/* ── Tabla ──────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={entriesWithBalance}
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

      {/* ── Modales ────────────────────────────────────── */}
      <CreateJournalEntryModal open={createOpen} onOpenChange={setCreateOpen} />

      {detailEntry && (
        <JournalEntryDetailModal
          open={!!detailEntry}
          onOpenChange={(open) => {
            if (!open) setDetailEntry(null);
          }}
          entry={detailEntry}
          canAnular={can('accounting:write') && detailEntry.status === 'Valido'}
          onAnular={() => handleAnular(detailEntry._id)}
          isAnulando={anularMutation.isPending}
        />
      )}

      {editEntry && (
        <EditJournalEntryModal
          open={!!editEntry}
          onOpenChange={(open) => {
            if (!open) setEditEntry(null);
          }}
          entry={editEntry}
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