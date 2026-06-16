import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormSelect } from '@/components/forms/FormSelect';
import { AccountTreeSelect } from '@/features/accounts/components/AccountTreeSelect';
import { ProductSelect } from '@/features/products/components/ProductSelect'; 
import { useCreateJournalEntry } from '../hooks/useJournalEntryMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { CreateJournalEntryPayload } from '@/types';

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  type: z.enum(['Ingreso', 'Egreso'], { message: 'Seleccione el tipo' }),
  concept: z.string().trim().min(1, 'El concepto es requerido'),
  account: z
    .string()
    .min(1, 'Debe seleccionar una cuenta')
    .uuid( 'Cuenta inválida'),
  product: z
    .string()
    .nullable()
    .optional()
    // FIX: Si el valor es "none", lo transformamos a null para el backend
    .transform((val) => (val === 'none' || val === '' ? null : val))
    .refine((val) => !val || z.string().uuid().safeParse(val).success, {
      message: 'Producto inválido',
    }),
  amount: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number().positive('El monto debe ser mayor a cero'),
  ),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = [
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Egreso', label: 'Egreso' },
];

export function CreateJournalEntryModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateJournalEntry();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      type: 'Ingreso',
      concept: '',
      account: '',
      product: 'none', // FIX: El valor por defecto ahora es "none" para coincidir con el Select
      amount: undefined as any,
    },
  });

  const selectedType = form.watch('type');

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(
        values as unknown as CreateJournalEntryPayload,
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
      title="Nuevo Asiento Contable"
      description="Registre un ingreso o egreso en el libro diario."
      size="2xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDatePicker
              name="date"
              control={form.control as any}
              label="Fecha del asiento"
            />
            <FormSelect
              name="type"
              control={form.control as any}
              label="Tipo de movimiento"
              options={TYPE_OPTIONS} 
            />
          </div>

          <FormTextArea
            name="concept"
            control={form.control as any}
            label="Concepto"
            placeholder="Describa el motivo del movimiento"
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AccountTreeSelect
              name="account"
              control={form.control as any}
              label="Cuenta contable"
              mode="transaction"
            />

            <ProductSelect
              name="product"
              control={form.control as any}
              label="Producto (opcional)"
            />
          </div>

          <FormInput
            name="amount"
            control={form.control as any}
            label={`Monto (${
              selectedType === 'Ingreso' ? 'Ingreso' : 'Egreso'
            })`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />

          {form.formState.errors.root && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear Asiento"
              loadingLabel="Creando…"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}