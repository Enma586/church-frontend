import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteSacrament } from '../hooks/useDeleteSacrament';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface DeleteSacramentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacramentId: string;
}

export function DeleteSacramentModal({ open, onOpenChange, sacramentId }: DeleteSacramentModalProps) {
  const deleteMutation = useDeleteSacrament();
  const { notifyDeleted } = useNotificationActions();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(sacramentId);
      notifyDeleted('Sacramento');
      onOpenChange(false);
    } catch {}
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar sacramento"
      description="¿Estás seguro de eliminar este registro sacramental? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}