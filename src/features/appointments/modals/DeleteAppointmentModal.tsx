import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteAppointment } from '../hooks/useDeleteAppointment';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  id: string;
}

export function DeleteAppointmentModal({ open, onOpenChange, id }: Props) {
  const mutation = useDeleteAppointment();
  const { notifyDeleted } = useNotificationActions();
  const handle = async () => {
    try {
      await mutation.mutateAsync(id);
      notifyDeleted('Cita');
      onOpenChange(false);
    } catch {}
  };
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar cita"
      description="¿Eliminar esta cita permanentemente?"
      confirmLabel="Eliminar"
      variant="danger"
      loading={mutation.isPending}
      onConfirm={handle}
    />
  );
}