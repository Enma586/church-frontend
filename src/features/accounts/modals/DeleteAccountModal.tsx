import { useState } from 'react';
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
  const [isBlocked, setIsBlocked] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && hasChildren) {
      setIsBlocked(true);
      return;
    }
    setIsBlocked(false);
    onOpenChange(isOpen);
  };

  const handleDelete = () => {
    // FIX: Al usar mutate, el hook maneja el catch automáticamente por debajo.
    // Solo cerramos el modal si la mutación fue exitosa.
    deleteMutation.mutate(accountId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (hasChildren) {
    return (
      <ConfirmModal
        open={open}
        onOpenChange={onOpenChange}
        title="No se puede eliminar"
        description={`La cuenta "${accountCode} — ${accountName}" tiene subcuentas asociadas. Debe eliminar o reasignar las subcuentas antes de eliminar esta cuenta.`}
        confirmLabel="Entendido"
        variant="default"
        loading={false}
        onConfirm={() => onOpenChange(false)}
      />
    );
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar cuenta contable"
      description={`¿Está seguro de eliminar la cuenta "${accountCode} — ${accountName}"? Si esta cuenta está referenciada en asientos contables, la eliminación será rechazada.`}
      confirmLabel="Eliminar"
      variant="danger"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  );
}