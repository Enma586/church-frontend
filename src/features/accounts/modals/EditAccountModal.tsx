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
import { Input } from '@/components/ui/input';
import { useUpdateAccount } from '../hooks/useAccountMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
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
  parentAccount: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || /^[0-9a-fA-F]{24}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val), {
      message: 'ID de cuenta inválido',
    })
    .transform((val) => (val === '' || val === 'null' ? null : val)),
  acceptsTransactions: z.boolean(),
  isActive: z.boolean(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
}

const extractParentId = (parent: unknown): string | null => {
  if (!parent) return null;
  if (typeof parent === 'object' && parent !== null && '_id' in parent) {
    return String((parent as { _id: string })._id);
  }
  return String(parent);
};

export function EditAccountModal({
  open,
  onOpenChange,
  account,
}: EditAccountModalProps) {
  const updateMutation = useUpdateAccount();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
      parentAccount: extractParentId(account.parentAccount),
      acceptsTransactions: account.acceptsTransactions,
      isActive: account.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: account.name,
        type: account.type,
        parentAccount: extractParentId(account.parentAccount),
        acceptsTransactions: account.acceptsTransactions,
        isActive: account.isActive,
      });
    }
  }, [open, account, form]);

  const onSubmit = async (values: EditFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: account._id,
        data: values as unknown as UpdateAccountPayload,
      });
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input disabled value={account.code} className="bg-muted" />
            </div>
            <FormSelect
              name="type"
              control={form.control}
              label="Tipo de cuenta"
              options={CUENTA_TYPE_OPTIONS}
            />
          </div>

          <FormInput name="name" control={form.control} label="Nombre" />

          <AccountTreeSelect
            name="parentAccount"
            control={form.control}
            label="Cuenta padre (opcional)"
            mode="parent"
          />

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-acceptsTransactions"
                checked={form.watch('acceptsTransactions')}
                onCheckedChange={(v) =>
                  form.setValue('acceptsTransactions', v, {
                    shouldValidate: true,
                  })
                }
              />
              <div>
                <Label htmlFor="edit-acceptsTransactions">
                  Acepta transacciones
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si desactivas, será una <strong>cuenta de agrupación</strong>{' '}
                  (solo sirve como padre de otras)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(v) =>
                  form.setValue('isActive', v, { shouldValidate: true })
                }
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