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
import { useCreateJournalEntry, useDeleteJournalEntry } from '../hooks/useJournalEntryMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { JournalEntry, CreateJournalEntryPayload } from '@/types';

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
  entry: JournalEntry;
}

const TYPE_OPTIONS = [
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Egreso', label: 'Egreso' },
];

export function EditJournalEntryModal({ open, onOpenChange, entry }: Props) {
  const deleteMutation = useDeleteJournalEntry();
  const createMutation = useCreateJournalEntry();

  const accountId =
    typeof entry.account === 'object' && entry.account !== null
      ? entry.account._id
      : (entry.account as string);

  const productId =
    entry.product && typeof entry.product === 'object' && entry.product !== null
      ? entry.product._id
      : entry.product
        ? (entry.product as string)
        : 'none';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date(entry.date).toISOString().slice(0, 10),
      type: entry.type,
      concept: entry.concept,
      account: accountId,
      product: productId || 'none',
      amount: entry.amount,
    },
  });

  const selectedType = form.watch('type');

  const onSubmit = async (values: FormValues) => {
    try {
      await deleteMutation.mutateAsync(entry._id);
      await createMutation.mutateAsync(values as unknown as CreateJournalEntryPayload);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  const isPending = deleteMutation.isPending || createMutation.isPending;

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Asiento Contable"
      description={`Editando comprobante ${entry.voucherNumber}`}
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
            label={`Monto (${selectedType === 'Ingreso' ? 'Ingreso' : 'Egreso'})`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />

          <div className="flex justify-end pt-4 border-t">
            <FormSubmitButton
              isSubmitting={isPending}
              label="Guardar Cambios"
              loadingLabel="Guardando…"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
