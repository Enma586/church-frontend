import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { AccountTreeSelect } from '../components/AccountTreeSelect';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUpdateAccount } from '../hooks/useAccountMutations';
import type { Account, UpdateAccountPayload } from '@/types';

const CUENTA_TYPE_OPTIONS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Pasivo', label: 'Pasivo' },
  { value: 'Patrimonio', label: 'Patrimonio' },
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Gasto', label: 'Gasto' },
];

const editSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  type: z.enum(['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto']),
  parentAccount: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
  acceptsTransactions: z.boolean(),
  isActive: z.boolean(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
}

export function EditAccountModal({ open, onOpenChange, account }: EditAccountModalProps) {
  const updateMutation = useUpdateAccount();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
      parentAccount: typeof account.parentAccount === 'object'
        ? account.parentAccount._id
        : account.parentAccount ?? null,
      acceptsTransactions: account.acceptsTransactions,
      isActive: account.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: account.name,
        type: account.type,
        parentAccount: typeof account.parentAccount === 'object'
          ? account.parentAccount._id
          : account.parentAccount ?? null,
        acceptsTransactions: account.acceptsTransactions,
        isActive: account.isActive,
      });
    }
  }, [open, account, form]);

  const onSubmit = async (values: EditFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: account._id,
        data: values as UpdateAccountPayload,
      });
      onOpenChange(false);
    } catch {
      // error handled by hook
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Cuenta Contable"
      description={`Editando: ${account.code} — ${account.name}`}
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="code"
              control={form.control as never}
              label="Código"
              disabled
              value={account.code}
            />
            <FormSelect
              name="type"
              control={form.control}
              label="Tipo de cuenta"
              options={CUENTA_TYPE_OPTIONS}
            />
          </div>

          <FormInput name="name" control={form.control} label="Nombre" />

          <AccountTreeSelect name="parentAccount" control={form.control} label="Cuenta padre (opcional)" />

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-acceptsTransactions"
                checked={form.watch('acceptsTransactions')}
                onCheckedChange={(v) => form.setValue('acceptsTransactions', v)}
              />
              <Label htmlFor="edit-acceptsTransactions">Acepta transacciones</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(v) => form.setValue('isActive', v)}
              />
              <Label htmlFor="edit-isActive">Activa</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={updateMutation.isPending}
              label="Guardar Cambios"
              loadingLabel="Guardando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}