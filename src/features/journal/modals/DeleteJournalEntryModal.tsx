import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteJournalEntry } from '../hooks/useJournalEntryMutations';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  voucherNumber: string;
}

export function DeleteJournalEntryModal({ open, onOpenChange, entryId, voucherNumber }: Props) {
  const deleteMutation = useDeleteJournalEntry();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(entryId);
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar asiento contable"
      description={`¿Estás seguro de eliminar el asiento "${voucherNumber}"? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}