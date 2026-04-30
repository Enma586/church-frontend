import { useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { SacramentFilters } from '../filters/SacramentFilters';
import { SacramentCard } from '../components/SacramentCard';
import { CreateSacramentModal } from '../modals/CreateSacramentModal';
import { EditSacramentModal } from '../modals/EditSacramentModal';
import { SacramentDetailModal } from '../modals/SacramentDetailModal';
import { DeleteSacramentModal } from '../modals/DeleteSacramentModal';
import { useSacraments } from '../hooks/useSacraments';
import { usePagination } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Sacrament, SacramentQueryParams } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

export default function SacramentsPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const user = useAppSelector((s) => s.auth.user);
  const isCoordinador = user?.role === 'Coordinador';
  const isEditor = isCoordinador || user?.role === 'Subcoordinador';

  const [filters, setFilters] = useState<SacramentQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Sacrament | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<Sacrament | null>(null);

  const { data, isLoading } = useSacraments({ ...filters, page, limit });
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFilterApply = useCallback((f: SacramentQueryParams) => {
    setFilters(f);
    goToPage(1);
  }, [goToPage]);

  const columns: ColumnDef<Sacrament, unknown>[] = [
    {
      header: 'Miembro',
      accessorFn: (row) =>
        typeof row.memberId === 'object' ? row.memberId.fullName : '—',
    },
    { header: 'Tipo', accessorKey: 'type' },
    {
      header: 'Fecha',
      accessorFn: (row) => format(new Date(row.date), 'PPP', { locale: es }),
    },
    { header: 'Lugar', accessorKey: 'place' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailsItem(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          {isEditor && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isCoordinador && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row.original._id)}>
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
        <h1 className="text-2xl font-bold">Sacramentos</h1>
        {isEditor && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo sacramento
          </Button>
        )}
      </div>

      <TableToolbar>
        <SacramentFilters onApply={handleFilterApply} initialValues={filters} />
      </TableToolbar>

      {isDesktop ? (
        <DataTable columns={columns} data={items} loading={isLoading} emptyTitle="Sin sacramentos" emptyDescription={Object.keys(filters).length > 0 ? 'No hay resultados con los filtros actuales.' : 'Aún no hay sacramentos registrados.'} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((s) => <SacramentCard key={s._id} sacrament={s} onClick={() => setDetailsItem(s)} />)}
        </div>
      )}

      {pagination && <TablePagination pagination={pagination} onPageChange={goToPage} onLimitChange={setPerPage} />}

      <CreateSacramentModal open={createOpen} onOpenChange={setCreateOpen} />
      {editItem && <EditSacramentModal open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }} sacrament={editItem} />}
      <SacramentDetailModal open={!!detailsItem} onOpenChange={(o) => { if (!o) setDetailsItem(null); }} sacrament={detailsItem} />
      {deleteTarget && <DeleteSacramentModal open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} sacramentId={deleteTarget} />}
    </div>
  );
}