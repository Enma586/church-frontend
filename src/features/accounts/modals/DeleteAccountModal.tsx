import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useDeleteAccount } from '../hooks/useAccountMutations';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
  accountCode: string;
  hasChildren: boolean;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  accountId,
  accountName,
  accountCode,
  hasChildren,
}: DeleteAccountModalProps) {
  const deleteMutation = useDeleteAccount();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(accountId);
      onOpenChange(false);
    } catch {
      // error handled by hook
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar cuenta contable"
      description={
        hasChildren
          ? `No se puede eliminar "${accountCode} — ${accountName}" porque tiene subcuentas asociadas. Elimine las subcuentas primero.`
          : `¿Estás seguro de eliminar "${accountCode} — ${accountName}"? Podría fallar si está referenciada en asientos o productos.`
      }
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={hasChildren ? () => onOpenChange(false) : handleDelete}
    />
  );
}