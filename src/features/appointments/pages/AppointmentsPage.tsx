import { useState } from 'react';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  LayoutList,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { FilterSearch } from '@/components/filters/FilterSearch';
import { FilterDateRange } from '@/components/filters/FilterDateRange';
import { AppointmentCard } from '../components/AppointmentCard';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { CreateAppointmentModal } from '../modals/CreateAppointmentModal';
import { EditAppointmentModal } from '../modals/EditAppointmentModal';
import { AppointmentDetailModal } from '../modals/AppointmentDetailModal';
import { DeleteAppointmentModal } from '../modals/DeleteAppointmentModal';
import { CalendarGrid } from '../calendar/CalendarGrid';
import { useAppointments } from '../hooks/useAppointments';
import { usePagination } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment,  } from '../types/appointment.types';
import type { ColumnDef } from '@tanstack/react-table';

export default function AppointmentsPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const user = useAppSelector((s) => s.auth.user);
  const isEditor =
    user?.role === 'Coordinador' || user?.role === 'Subcoordinador';
  const isCoordinador = user?.role === 'Coordinador';

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const { data, isLoading } = useAppointments({
    page,
    limit,
    type: 'cita_pastoral',
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnDef<Appointment, unknown>[] = [
    { header: 'Título', accessorKey: 'title' },
    {
      header: 'Miembro',
      accessorFn: (row) => row.member?.fullName ?? '—',
    },
    {
      header: 'Inicio',
      accessorFn: (row) =>
        row.startDateTime
          ? format(new Date(row.startDateTime), 'dd/MM HH:mm', { locale: es })
          : '—',
    },
    {
      header: 'Estado',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s === 'Programada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : s === 'Completada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: 'Sync',
      cell: ({ row }) => <SyncStatusBadge status={row.original.syncStatus} />,
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
            onClick={() => setDetailsItem(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isEditor && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditItem(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isCoordinador && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(row.original._id)}
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
        <h1 className="text-2xl font-bold">Citas Pastorales</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="mr-1.5 h-4 w-4" /> Tabla
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" /> Calendario
            </Button>
          </div>
          {isEditor && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo evento
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'table' && (
        <>
          <TableToolbar>
            {/* Eliminamos 'flex-wrap' y agregamos 'overflow-x-auto' para evitar que se rompa en móviles */}
            <div className="flex items-end gap-3 overflow-x-auto pb-2">
              <div className="min-w-50">
                <FilterSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar cita..."
                />
              </div>
              <div className="shrink-0">
                <FilterDateRange
                  label="Fechas"
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                />
              </div>
            </div>
          </TableToolbar>

          {isDesktop ? (
            <DataTable
              columns={columns}
              data={items}
              loading={isLoading}
              emptyTitle="Sin eventos"
              emptyDescription="Aún no hay eventos registradas."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={a}
                  onClick={() => setDetailsItem(a)}
                />
              ))}
            </div>
          )}

          {pagination && (
            <TablePagination
              pagination={pagination}
              onPageChange={goToPage}
              onLimitChange={setPerPage}
            />
          )}
        </>
      )}

      {viewMode === 'calendar' && <CalendarGrid />}

      <CreateAppointmentModal open={createOpen} onOpenChange={setCreateOpen} />
      {editItem && (
        <EditAppointmentModal
          open={!!editItem}
          onOpenChange={(o) => {
            if (!o) setEditItem(null);
          }}
          appointment={editItem}
        />
      )}
      {detailsItem && (
        <AppointmentDetailModal
          open={!!detailsItem}
          onOpenChange={(o) => {
            if (!o) setDetailsItem(null);
          }}
          appointment={detailsItem}
        />
      )}
      {deleteTarget && (
        <DeleteAppointmentModal
          open={!!deleteTarget}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
          id={deleteTarget}
        />
      )}
    </div>
  );
}