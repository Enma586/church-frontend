import { useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { PastoralNoteFilters } from '../filters/PastoralNoteFilters';
import { PastoralNoteCard } from '../components/PastoralNoteCard';
import { SensitiveBadge } from '../components/SensitiveBadge';
import { CreatePastoralNoteModal } from '../modals/CreatePastoralNoteModal';
import { EditPastoralNoteModal } from '../modals/EditPastoralNoteModal';
import { DeletePastoralNoteModal } from '../modals/DeletePastoralNoteModal';
import { usePastoralNotes } from '../hooks/usePastoralNotes';
import { usePagination } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PastoralNote, PastoralNoteQueryParams } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

export default function PastoralNotesPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const user = useAppSelector((s) => s.auth.user);
  const isCoordinador = user?.role === 'Coordinador';
  const isEditor = isCoordinador || user?.role === 'Subcoordinador';

  const [filters, setFilters] = useState<PastoralNoteQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PastoralNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [preview, setPreview] = useState<PastoralNote | null>(null);

  const { data, isLoading } = usePastoralNotes({ ...filters, page, limit });
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handleApply = useCallback((f: PastoralNoteQueryParams) => { setFilters(f); goToPage(1); }, [goToPage]);

  const columns: ColumnDef<PastoralNote, unknown>[] = [
    {
      header: 'Miembro',
      accessorFn: (row) => typeof row.memberId === 'object' ? row.memberId.fullName : '—',
    },
    {
      header: 'Contenido',
      accessorKey: 'content',
      cell: ({ getValue }) => {
        const text = getValue() as string;
        return <span className="line-clamp-1 max-w-7 block">{text}</span>;
      },
    },
    {
      header: 'Autor',
      accessorFn: (row) => typeof row.authorId === 'object' ? `@${row.authorId.username}` : '—',
    },
    {
      header: 'Nivel',
      cell: ({ row }) => <SensitiveBadge isSensitive={row.original.isSensitive} />,
    },
    {
      header: 'Fecha',
      accessorFn: (row) => format(new Date(row.createdAt), 'dd/MM/yy HH:mm', { locale: es }),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreview(row.original)}>
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
        <h1 className="text-2xl font-bold">Notas Pastorales</h1>
        {isEditor && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva nota
          </Button>
        )}
      </div>

      <TableToolbar>
        <PastoralNoteFilters onApply={handleApply} initialValues={filters} />
      </TableToolbar>

      {isDesktop ? (
        <DataTable columns={columns} data={items} loading={isLoading} emptyTitle="Sin notas" emptyDescription={Object.keys(filters).length > 0 ? 'No hay resultados.' : 'Aún no hay notas pastorales.'} />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((n) => <PastoralNoteCard key={n._id} note={n} onClick={() => setPreview(n)} />)}
        </div>
      )}

      {pagination && <TablePagination pagination={pagination} onPageChange={goToPage} onLimitChange={setPerPage} />}

      {/* Preview modal */}
      {preview && (
        <EditPastoralNoteModal
          open={!!preview}
          onOpenChange={(o) => { if (!o) setPreview(null); }}
          note={preview}
        />
      )}

      <CreatePastoralNoteModal open={createOpen} onOpenChange={setCreateOpen} />
      {editItem && <EditPastoralNoteModal open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }} note={editItem} />}
      {deleteTarget && <DeletePastoralNoteModal open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} noteId={deleteTarget} />}
    </div>
  );
}