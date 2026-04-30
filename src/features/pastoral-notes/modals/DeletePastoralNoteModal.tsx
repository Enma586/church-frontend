import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeletePastoralNote } from '../hooks/useDeletePastoralNote';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; noteId: string; }

export function DeletePastoralNoteModal({ open, onOpenChange, noteId }: Props) {
  const deleteMutation = useDeletePastoralNote();
  const { notifyDeleted } = useNotificationActions();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(noteId);
      notifyDeleted('Nota pastoral');
      onOpenChange(false);
    } catch {}
  };

  return (
    <ConfirmModal
      open={open} onOpenChange={onOpenChange}
      title="Eliminar nota" description="¿Estás seguro de eliminar esta nota pastoral?"
      confirmLabel="Eliminar" variant="danger"
      loading={deleteMutation.isPending} onConfirm={handleDelete}
    />
  );
}