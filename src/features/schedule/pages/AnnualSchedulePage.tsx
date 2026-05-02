import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { FilterSearch } from '@/components/filters/FilterSearch';
import { FilterDateRange } from '@/components/filters/FilterDateRange';
import { CreateScheduleEventModal } from '../modals/CreateScheduleEventModal';
import { EditScheduleEventModal } from '../modals/EditScheduleEventModal';
import { ScheduleEventDetailModal } from '../modals/ScheduleEventDetailModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useScheduleEvents } from '../hooks/useScheduleEvents';
import { useDeleteScheduleEvent } from '../hooks/useDeleteScheduleEvent';
import { usePagination } from '@/hooks/usePagination';
import { useAppSelector } from '@/store/hooks';
import type { ScheduleEvent } from '../types/schedule.types';
import type { ColumnDef } from '@tanstack/react-table';

export default function SchedulePage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const user = useAppSelector((s) => s.auth.user);
  
  const isEditor = user?.role === 'Coordinador' || user?.role === 'Subcoordinador';
  const isCoordinador = user?.role === 'Coordinador';

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<ScheduleEvent | null>(null);
  const [editItem, setEditItem] = useState<ScheduleEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useDeleteScheduleEvent();
  const { data, isLoading } = useScheduleEvents({
    page,
    limit,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnDef<ScheduleEvent, unknown>[] = [
    { header: 'Título', accessorKey: 'title' },
    {
      header: 'Fecha',
      accessorFn: (row) => {
        if (!row.allDayDate) return '—';
        const dateStr = format(new Date(row.allDayDate), "EEEE, dd/MM/yyyy", { locale: es });
        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      },
    },
    {
      header: 'Encargados',
      cell: ({ row }) => {
        const list = row.original.participantsList || row.original.participants;
        if (!list || !list.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {list.slice(0, 2).map((m: any) => (
              <span key={m._id || m} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {m.fullName || 'Asignado'}
              </span>
            ))}
            {list.length > 2 && <span className="text-[10px] text-muted-foreground">+{list.length - 2}</span>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setDetailsItem(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isEditor && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setEditItem(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isCoordinador && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteId(row.original._id)}
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cronograma Anual</h1>
          <p className="text-sm text-muted-foreground">Planificación general de actividades y eventos.</p>
        </div>
        {isEditor && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo evento
          </Button>
        )}
      </div>

      <TableToolbar>
        <div className="flex items-end gap-4 w-full">
          <div className="w-75 shrink-0">
            <FilterSearch value={search} onChange={setSearch} placeholder="Buscar evento..." />
          </div>
          <div className="shrink-0">
            <FilterDateRange label="Fechas" dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={setDateFrom} onDateToChange={setDateTo} />
          </div>
        </div>
      </TableToolbar>

      <DataTable columns={columns} data={events} loading={isLoading} emptyTitle="No hay eventos" />

      {pagination && <TablePagination pagination={pagination} onPageChange={goToPage} onLimitChange={setPerPage} />}

      <CreateScheduleEventModal open={createOpen} onOpenChange={setCreateOpen} />

      <ScheduleEventDetailModal 
        open={!!detailsItem} 
        onOpenChange={(o) => !o && setDetailsItem(null)} 
        event={detailsItem} 
      />

      {editItem && (
        <EditScheduleEventModal 
          open={!!editItem} 
          onOpenChange={(o) => !o && setEditItem(null)} 
          event={editItem} 
        />
      )}

      {deleteId && (
        <ConfirmModal
          open={!!deleteId}
          onOpenChange={(o) => !o && setDeleteId(null)}
          title="Eliminar evento"
          description="Esta acción eliminará el evento permanentemente del cronograma."
          variant="danger"
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}