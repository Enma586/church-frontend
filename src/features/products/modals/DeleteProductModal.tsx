import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteProduct } from '../hooks/useProductMutations';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function DeleteProductModal({ open, onOpenChange, productId, productName }: Props) {
  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productId);
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar producto"
      description={`¿Estás seguro de eliminar "${productName}"?`}
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}