import { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  FileDigit,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
  Patrimonio:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
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

function resolveParentLabel(
  parent: Account['parentAccount'],
  accountMap: Map<string, Account>,
): string {
  if (parent === null || parent === undefined) return '—';
  if (typeof parent === 'object') return `${parent.code} — ${parent.name}`;
  if (typeof parent === 'string') {
    const found = accountMap.get(parent);
    if (found) return `${found.code} — ${found.name}`;
    return parent;
  }
  return String(parent);
}

/**
 * Construye una jerarquía plana donde las cuentas padre aparecen primero
 * y sus hijas inmediatamente después, con indentación calculada.
 */
function buildHierarchy(accounts: Account[]): Account[] {
  const accountMap = new Map<string, Account>();
  const childrenMap = new Map<string, Account[]>();
  const roots: Account[] = [];

  for (const a of accounts) {
    accountMap.set(a._id, a);
  }

  for (const a of accounts) {
    // FIX: Agregamos a.parentAccount && para evitar el error de null._id
    const parentId =
      a.parentAccount && typeof a.parentAccount === 'object'
        ? a.parentAccount._id
        : a.parentAccount;

    if (parentId) {
      const list = childrenMap.get(parentId as string) ?? [];
      list.push(a);
      childrenMap.set(parentId as string, list);
    } else {
      roots.push(a);
    }
  }

  // Ordenar: raíces primero por código, luego recursivamente las hijas
  const sorted: Account[] = [];
  const visited = new Set<string>();

  function traverse(acct: Account, depth: number) {
    if (visited.has(acct._id)) return;
    visited.add(acct._id);

    sorted.push({ ...acct, _depth: depth } as Account & { _depth: number });

    const children = (childrenMap.get(acct._id) ?? []).map((c) => {
      // Asegurar que las hijas tengan parentAccount populado si no lo tienen
      if (typeof c.parentAccount === 'string') {
        const parent = accountMap.get(c.parentAccount);
        if (parent) {
          return { ...c, parentAccount: parent };
        }
      }
      return c;
    });

    children
      .sort((a, b) => a.code.localeCompare(b.code))
      .forEach((child) => traverse(child, depth + 1));
  }

  roots
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((root) => traverse(root, 0));

  return sorted;
}

export default function AccountsPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { can } = usePermissions();

  const [filters, setFilters] = useState<AccountQueryParams>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const { data, isLoading } = useAccounts({ ...filters, page, limit });

  const rawAccounts = data?.data ?? [];
  const pagination = data?.pagination;

  // Jerarquía ordenada (padres primero, hijas indentadas)
  const hierarchical = useMemo(() => buildHierarchy(rawAccounts), [rawAccounts]);

  // Mapa ID → Account para resolver parentAccount
  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    for (const a of rawAccounts) {
      map.set(a._id, a);
    }
    return map;
  }, [rawAccounts]);

  const columns: ColumnDef<Account>[] = useMemo(
    () => [
      {
        header: 'Código',
        accessorKey: 'code',
        cell: ({ row, getValue }) => {
          const account = row.original as Account & { _depth?: number };
          const depth = account._depth ?? 0;
          const code = getValue() as string;
          const isGrouping = !account.acceptsTransactions;

          return (
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
              {depth > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              )}

              {isGrouping ? (
                <FolderTree className="h-4 w-4 text-amber-500 shrink-0" />
              ) : (
                <FileDigit className="h-4 w-4 text-blue-500 shrink-0" />
              )}

              <span
                className={cn(
                  'font-mono text-sm tabular-nums',
                  isGrouping && 'font-bold',
                )}
              >
                {code}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: ({ row, getValue }) => {
          const account = row.original as Account & { _depth?: number };
          const name = getValue() as string;
          const isGrouping = !account.acceptsTransactions;
          const childrenCount = account.children?.length ?? 0;

          return (
            <div className="flex items-center gap-2">
              <span className={cn('text-sm', isGrouping && 'font-semibold')}>
                {name}
              </span>
              {/* MEJORA VISUAL: Contador de subcuentas con borde y texto anaranjado */}
              {isGrouping && childrenCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 h-4 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                >
                  {childrenCount} sub
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: 'Tipo',
        accessorKey: 'type',
        cell: ({ getValue }) => {
          const type = getValue() as CuentaType;
          return (
            <Badge className={cn('text-xs', TYPE_BADGES[type] ?? '')}>
              {type}
            </Badge>
          );
        },
      },
      {
        header: 'Cuenta Padre',
        accessorFn: (row) => row.parentAccount ?? null,
        cell: ({ getValue }) => {
          const parent = getValue() as Account['parentAccount'];
          return (
            <span className="text-xs text-muted-foreground">
              {resolveParentLabel(parent, accountMap)}
            </span>
          );
        },
      },
      {
        header: 'Estado',
        accessorKey: 'isActive',
        cell: ({ row, getValue }) => {
          const active = getValue() as boolean;
          const account = row.original;
          const isGrouping = !account.acceptsTransactions;
          return (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-block w-2 h-2 rounded-full',
                  active ? 'bg-green-500' : 'bg-red-400',
                )}
              />
              <span className="text-xs text-muted-foreground">
                {active ? 'Activa' : 'Inactiva'}
              </span>
              {/* MEJORA VISUAL: Badge de agrupación con fondo anaranjado */}
              {isGrouping && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/80 dark:text-amber-300 dark:hover:bg-amber-900">
                  Agrupación
                </Badge>
              )}
            </div>
          );
        },
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
    ],
    [accountMap, can],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1 mr-3">
              <FolderTree className="h-3.5 w-3.5 text-amber-500" /> Agrupación
            </span>
            <span className="inline-flex items-center gap-1">
              <FileDigit className="h-3.5 w-3.5 text-blue-500" /> Transaccional
            </span>
          </p>
        </div>
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
          <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Limpiar
          </Button>
        </div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={hierarchical}
        loading={isLoading}
        emptyTitle="Sin cuentas"
        emptyDescription="Aún no hay cuentas contables registradas. Cree la primera cuenta para comenzar."
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