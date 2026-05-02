import { useState, useCallback } from 'react';
import { Plus, Pencil, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { UserFilters } from '../filters/UserFilters';
import { UserCard } from '../components/UserCard';
import { RoleBadge } from '../components/RoleBadge';
import { CreateUserModal } from '../modals/CreateUserModal';
import { EditUserModal } from '../modals/EditUserModal';
import { UserDetailsModal } from '../modals/UserDetailsModal';
import { useUsers } from '../hooks/useUsers';
import { usePagination } from '@/hooks/usePagination';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppSelector } from '@/store/hooks';
import type { User, UserQueryParams } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

export default function UsersPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const user = useAppSelector((s) => s.auth.user);
  const isCoordinador = user?.role === 'Coordinador';

  const [filters, setFilters] = useState<UserQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ ...filters, page, limit });
  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFilterApply = useCallback(
    (newFilters: UserQueryParams) => {
      setFilters(newFilters);
      goToPage(1);
    },
    [goToPage],
  );

  const columns: ColumnDef<User, unknown>[] = [
    {
      header: 'Miembro',
      accessorFn: (row) =>
        typeof row.memberId === 'object' && row.memberId
          ? row.memberId.fullName
          : '—',
    },
    { header: 'Usuario', accessorKey: 'username' },
    {
      header: 'Rol',
      accessorKey: 'role',
      cell: ({ getValue }) => <RoleBadge role={getValue() as User['role']} />,
    },
    {
      header: 'Estado',
      accessorKey: 'isActive',
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {active ? 'Activo' : 'Inactivo'}
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
            onClick={() => setDetailsUser(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
          {isCoordinador && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditUser(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        {isCoordinador && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
          </Button>
        )}
      </div>

      <TableToolbar>
        <UserFilters onApply={handleFilterApply} initialValues={filters} />
      </TableToolbar>

      {isDesktop ? (
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          emptyTitle="Sin usuarios"
          emptyDescription={
            Object.keys(filters).length > 0
              ? 'No hay resultados con los filtros actuales.'
              : 'Aún no hay usuarios registrados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.map((u) => (
            <UserCard key={u._id} user={u} onClick={() => setDetailsUser(u)} />
          ))}
        </div>
      )}

      {pagination && (
        <TablePagination pagination={pagination} onPageChange={goToPage} onLimitChange={setPerPage} />
      )}

      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />

      {editUser && (
        <EditUserModal
          open={!!editUser}
          onOpenChange={(open) => { if (!open) setEditUser(null); }}
          user={editUser}
        />
      )}

      <UserDetailsModal
        open={!!detailsUser}
        onOpenChange={(open) => { if (!open) setDetailsUser(null); }}
        user={detailsUser}
      />
    </div>
  );
}