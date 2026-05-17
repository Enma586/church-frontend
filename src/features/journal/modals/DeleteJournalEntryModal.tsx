import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteJournalEntry } from '../hooks/useJournalEntryMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';

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
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar asiento contable"
      description={`¿Está seguro de eliminar el asiento "${voucherNumber}"? Esta acción no se puede deshacer y afectará los saldos contables.`}
      confirmLabel="Eliminar permanentemente"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}