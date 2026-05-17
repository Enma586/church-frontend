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
import type { CreateJournalEntryPayload } from '@/types';

const lineSchema = z.object({
  account: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Cuenta requerida'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().trim().optional(),
});

const schema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  concept: z.string().trim().min(1, 'El concepto es requerido'),
  lines: z.array(lineSchema).min(2, 'Mínimo 2 líneas'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJournalEntryModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateJournalEntry();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      lines: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    const totalDebit = values.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = values.lines.reduce((s, l) => s + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      form.setError('root', {
        message: `Descuadre: débito L.${totalDebit.toFixed(2)} ≠ crédito L.${totalCredit.toFixed(2)}`,
      });
      return;
    }

    try {
      await createMutation.mutateAsync(values as unknown as CreateJournalEntryPayload);
      form.reset();
      onOpenChange(false);
    } catch {
      // handled by hook
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo Asiento Contable"
      description="Partida doble — débito debe igualar crédito."
      size="4xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDatePicker
              name="date"
              control={form.control}
              label="Fecha del asiento"
            />
          </div>

          <FormTextArea
            name="concept"
            control={form.control}
            label="Concepto"
            placeholder="Descripción del movimiento contable"
            rows={3}
          />

          <JournalLinesTable
            control={form.control}
            watch={form.watch}
            setValue={form.setValue}
            name="lines"
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive font-medium">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="flex justify-end pt-4 border-t">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear Asiento"
              loadingLabel="Creando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}