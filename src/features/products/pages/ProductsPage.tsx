import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { TablePagination } from '@/components/tables/TablePagination';
import { CreateProductModal } from '../modals/CreateProductModal';
import { EditProductModal } from '../modals/EditProductModal';
import { DeleteProductModal } from '../modals/DeleteProductModal';
import { useProducts } from '../hooks/useProducts';
import { usePagination } from '@/hooks/usePagination';
import { usePermissions } from '@/hooks/usePermissions';
import type { Product } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

export default function ProductsPage() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { can } = usePermissions();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({ page, limit });
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnDef<Product>[] = [
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Precio',
      accessorKey: 'defaultPrice',
      cell: ({ getValue }) => `L. ${(getValue() as number).toFixed(2)}`,
    },
    {
      header: 'Cuenta de Ingreso',
      accessorFn: (row) =>
        row.incomeAccountIdData
          ? `${row.incomeAccountIdData.code} — ${row.incomeAccountIdData.name}`
          : typeof row.incomeAccountId === 'object'
            ? `${row.incomeAccountId.code} — ${row.incomeAccountId.name}`
            : '—',
    },
    {
      header: 'Activo',
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
                onClick={() => setEditProduct(row.original)}
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
        <h1 className="text-2xl font-bold">Productos y Servicios</h1>
        {can('accounting:write') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        emptyTitle="Sin productos"
        emptyDescription="Aún no hay productos o servicios registrados."
      />

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={setPerPage}
        />
      )}

      <CreateProductModal open={createOpen} onOpenChange={setCreateOpen} />

      {editProduct && (
        <EditProductModal
          open={!!editProduct}
          onOpenChange={(open) => {
            if (!open) setEditProduct(null);
          }}
          product={editProduct}
        />
      )}

      {deleteTarget && (
        <DeleteProductModal
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          productId={deleteTarget._id}
          productName={deleteTarget.name}
        />
      )}
    </div>
  );
}