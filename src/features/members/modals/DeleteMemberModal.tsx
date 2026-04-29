import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteMember } from '../hooks/useDeleteMember';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface DeleteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

/**
 * Confirmation dialog before permanently removing a member.
 * Dispatches toast + bell notification on success.
 */
export function DeleteMemberModal({
  open,
  onOpenChange,
  memberId,
  memberName,
}: DeleteMemberModalProps) {
  const deleteMutation = useDeleteMember();
  const { notifyDeleted } = useNotificationActions();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(memberId);
      notifyDeleted('Miembro', memberName);
      onOpenChange(false);
    } catch {
      // error handled by hook
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar miembro"
      description={`¿Estás seguro de eliminar a "${memberName}"? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}