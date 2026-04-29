import { useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { MemberFilters } from '../filters/MemberFilters';
import { MemberCard } from '../components/MemberCard';
import { CreateMemberModal } from '../modals/CreateMemberModal';
import { EditMemberModal } from '../modals/EditMemberModal';
import { DeleteMemberModal } from '../modals/DeleteMemberModal';
import { useMembers } from '../hooks/useMembers';
import { usePagination } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Member, MemberQueryParams } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

/**
 * Main members list page.
 *
 * Features:
 * - Server‑side pagination & filters
 * - Table view (desktop) / Card view (mobile)
 * - Create / Edit / Delete modals (guarded by Coordinador role)
 */
export default function MembersPage() {
  const navigate = useNavigate();
  const { page, limit, goToPage, setPerPage } = usePagination();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const user = useAppSelector((s) => s.auth.user);
  const isCoordinador = user?.role === 'Coordinador';

  const [filters, setFilters] = useState<MemberQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useMembers({
    ...filters,
    page,
    limit,
  });

  const members = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFilterApply = useCallback(
    (newFilters: MemberQueryParams) => {
      setFilters(newFilters);
      goToPage(1);
    },
    [goToPage],
  );

  const columns: ColumnDef<Member, unknown>[] = [
    { header: 'Nombre', accessorKey: 'fullName' },
    { header: 'Género', accessorKey: 'gender' },
    {
      header: 'Departamento',
      accessorFn: (row) => (typeof row.departmentId === 'object' ? row.departmentId.name : '—'),
    },
    {
      header: 'Municipio',
      accessorFn: (row) => (typeof row.municipalityId === 'object' ? row.municipalityId.name : '—'),
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              val === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            {val}
          </span>
        );
      },
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
            onClick={() => navigate(`/members/${row.original._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isCoordinador && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditMember(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() =>
                  setDeleteTarget({ id: row.original._id, name: row.original.fullName })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Miembros</h1>
        {isCoordinador && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo miembro
          </Button>
        )}
      </div>

      <TableToolbar>
        <MemberFilters onApply={handleFilterApply} initialValues={filters} />
      </TableToolbar>

      {isDesktop ? (
        <DataTable
          columns={columns}
          data={members}
          loading={isLoading}
          emptyTitle="Sin miembros"
          emptyDescription={
            Object.keys(filters).length > 0
              ? 'No hay resultados con los filtros actuales.'
              : 'Aún no hay miembros registrados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <MemberCard key={m._id} member={m} onClick={() => navigate(`/members/${m._id}`)} />
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

      <CreateMemberModal open={createOpen} onOpenChange={setCreateOpen} />

      {editMember && (
        <EditMemberModal
          open={!!editMember}
          onOpenChange={(open) => {
            if (!open) setEditMember(null);
          }}
          member={editMember}
        />
      )}

      {deleteTarget && (
        <DeleteMemberModal
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          memberId={deleteTarget.id}
          memberName={deleteTarget.name}
        />
      )}
    </div>
  );
}