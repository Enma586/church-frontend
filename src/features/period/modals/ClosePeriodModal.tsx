import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useClosePeriod } from '../hooks/usePeriodMutations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const schema = z.object({
  date: z.string().min(1, 'La fecha de cierre es requerida'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClosePeriodModal({ open, onOpenChange }: Props) {
  const closeMutation = useClosePeriod();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await closeMutation.mutateAsync(values);
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
      title="Cerrar Período Contable"
      description="Bloquea transacciones en fechas anteriores a la fecha de cierre."
      size="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Al cerrar el período, no se podrán crear ni modificar asientos con
              fecha anterior a la fecha de cierre. Esta acción es reversible.
            </AlertDescription>
          </Alert>

          <FormDatePicker
            name="date"
            control={form.control}
            label="Fecha de cierre"
          />

          <div className="flex justify-end pt-4">
            <FormSubmitButton
              isSubmitting={closeMutation.isPending}
              label="Cerrar Período"
              loadingLabel="Cerrando..."
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}