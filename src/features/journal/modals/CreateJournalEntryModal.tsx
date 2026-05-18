import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { JournalLinesTable } from '../components/JournalLinesTable';
import { useCreateJournalEntry } from '../hooks/useJournalEntryMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import type { CreateJournalEntryPayload } from '@/types';

const lineSchema = z.object({
  account: z
    .string()
    .min(1, 'Debe seleccionar una cuenta')
    .regex(/^[0-9a-fA-F]{24}$/, 'Cuenta inválida'),
  debit: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    },
    z.number().min(0, 'No puede ser negativo'),
  ),
  credit: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    },
    z.number().min(0, 'No puede ser negativo'),
  ),
  description: z.string().trim().optional(),
});

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  concept: z.string().trim().min(1, 'El concepto es requerido'),
  lines: z
    .array(lineSchema)
    .min(2, 'Debe agregar al menos 2 líneas (débito y crédito)'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJournalEntryModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateJournalEntry();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema)as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      lines: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    const totalDebit = values.lines.reduce(
      (s, l) => s + (Number(l.debit) || 0),
      0,
    );
    const totalCredit = values.lines.reduce(
      (s, l) => s + (Number(l.credit) || 0),
      0,
    );

    if (totalDebit === 0 && totalCredit === 0) {
      form.setError('root', {
        message:
          'Debe ingresar al menos un monto en débito o crédito en las líneas del asiento.',
      });
      return;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      form.setError('root', {
        message: `El asiento no está balanceado. El total de débitos (L.${totalDebit.toFixed(2)}) debe ser igual al total de créditos (L.${totalCredit.toFixed(2)}).`,
      });
      return;
    }

    
    const accountIds = values.lines.map((l) => l.account);
    const duplicates = accountIds.filter(
      (id, index) => accountIds.indexOf(id) !== index,
    );
    if (duplicates.length > 0) {
      form.setError('root', {
        message:
          'No puede usar la misma cuenta en más de una línea del asiento.',
      });
      return;
    }

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
      description="Registre un asiento de partida doble. El total de débitos debe ser igual al total de créditos."
      size="4xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDatePicker
              name="date"
              control={form.control as any}
              label="Fecha del asiento"
            />
          </div>

          <FormTextArea
            name="concept"
            control={form.control as any}
            label="Concepto"
            placeholder="Describa el motivo del movimiento contable"
            rows={3}
          />

          <JournalLinesTable
            control={form.control as any}
            watch={form.watch}
            setValue={form.setValue}
            name="lines"
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