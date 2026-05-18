import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';

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
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar producto"
      description={`¿Está seguro de eliminar "${productName}"? Si este producto está referenciado en transacciones, la eliminación será rechazada.`}
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}