import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TableToolbar } from '@/components/tables/TableToolbar';
import { TablePagination } from '@/components/tables/TablePagination';
import { CreateAccountModal } from '../modals/CreateAccountModal';
import { EditAccountModal } from '../modals/EditAccountModal';
import { DeleteAccountModal } from '../modals/DeleteAccountModal';
import { useAccounts } from '../hooks/useAccounts';
import { usePagination } from '@/hooks/usePagination';
import { usePermissions } from '@/hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import type { Account, AccountQueryParams, CuentaType } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_BADGES: Record<CuentaType, string> = {
  Activo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Pasivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Patrimonio: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Ingreso: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Gasto: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'Activo', label: 'Activo' },
  { value: 'Pasivo', label: 'Pasivo' },
  { value: 'Patrimonio', label: 'Patrimonio' },
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Gasto', label: 'Gasto' },
];

export default function AccountsPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { can } = usePermissions();

  const [filters, setFilters] = useState<AccountQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const { data, isLoading } = useAccounts({ ...filters, page, limit });

  const accounts = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnDef<Account>[] = [
    { header: 'Código', accessorKey: 'code' },
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Tipo',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const type = getValue() as CuentaType;
        return <Badge className={TYPE_BADGES[type] ?? ''}>{type}</Badge>;
      },
    },
    {
      header: 'Cuenta Padre',
      accessorFn: (row) =>
        typeof row.parentAccount === 'object'
          ? `${row.parentAccount.code} — ${row.parentAccount.name}`
          : '—',
    },
    {
      header: 'Activa',
      accessorKey: 'isActive',
      cell: ({ getValue }) => (getValue() ? '✅' : '❌'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {can('accounting:write') && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditAccount(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setDeleteTarget(row.original)}
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
        <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
        {can('accounting:write') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Button>
        )}
      </div>

      <TableToolbar>
        <div className="flex items-center gap-3">
          <Select
            value={filters.type ?? 'all'}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                type: v === 'all' ? undefined : (v as CuentaType),
              }))
            }
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Tipo de cuenta" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={accounts}
        loading={isLoading}
        emptyTitle="Sin cuentas"
        emptyDescription="Aún no hay cuentas contables registradas."
      />

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={setPerPage}
        />
      )}

      <CreateAccountModal open={createOpen} onOpenChange={setCreateOpen} />

      {editAccount && (
        <EditAccountModal
          open={!!editAccount}
          onOpenChange={(open) => {
            if (!open) setEditAccount(null);
          }}
          account={editAccount}
        />
      )}

      {deleteTarget && (
        <DeleteAccountModal
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          accountId={deleteTarget._id}
          accountName={deleteTarget.name}
          accountCode={deleteTarget.code}
          hasChildren={(deleteTarget.children?.length ?? 0) > 0}
        />
      )}
    </div>
  );
}