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
import { useCreateAccount } from '../hooks/useAccountMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { CreateAccountPayload } from '@/types';

const CUENTA_TYPE_OPTIONS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Pasivo', label: 'Pasivo' },
  { value: 'Patrimonio', label: 'Patrimonio' },
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Gasto', label: 'Gasto' },
];

const createSchema = z.object({
  code: z.string().trim().min(1, 'El código es requerido'),
  name: z.string().trim().min(1, 'El nombre es requerido'),
  type: z.enum(['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto']),
  parentAccount: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
      message: 'ID de cuenta inválido',
    })
    .transform((val) => (val === '' || val === 'null' ? null : val)),
  acceptsTransactions: z.boolean(),
  isActive: z.boolean(),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAccountModal({
  open,
  onOpenChange,
}: CreateAccountModalProps) {
  const createMutation = useCreateAccount();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'Activo',
      parentAccount: null,
      acceptsTransactions: true,
      isActive: true,
    },
  });

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await createMutation.mutateAsync(
        values as unknown as CreateAccountPayload,
      );
      form.reset();
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva Cuenta Contable"
      description="Registra una cuenta en el catálogo contable."
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="code"
              control={form.control}
              label="Código"
              placeholder="1.1.01"
            />
            <FormSelect
              name="type"
              control={form.control}
              label="Tipo de cuenta"
              options={CUENTA_TYPE_OPTIONS}
            />
          </div>

          <FormInput
            name="name"
            control={form.control}
            label="Nombre"
            placeholder="Caja General"
          />

          <AccountTreeSelect
            name="parentAccount"
            control={form.control}
            label="Cuenta padre (opcional)"
            mode="parent"
          />

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="acceptsTransactions"
                checked={form.watch('acceptsTransactions')}
                onCheckedChange={(v) =>
                  form.setValue('acceptsTransactions', v, {
                    shouldValidate: true,
                  })
                }
              />
              <div>
                <Label htmlFor="acceptsTransactions">
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
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(v) =>
                  form.setValue('isActive', v, { shouldValidate: true })
                }
              />
              <Label htmlFor="isActive">Activa</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear Cuenta"
              loadingLabel="Creando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}