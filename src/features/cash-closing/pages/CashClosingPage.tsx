
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDenominations } from '../hooks/useCashClosings';
import { useCreateCashClosing } from '../hooks/useCashClosingMutations';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import { Calculator, DollarSign } from 'lucide-react';

interface Props {
  denominations: number[];
}

function CashClosingForm({ denominations }: Props) {
  const createMutation = useCreateCashClosing();

  // FIX: Usamos z.ZodTypeAny en lugar de z.ZodNumber para aceptar preprocess
  const denominationFields: Record<string, z.ZodTypeAny> = {};
  
  for (const d of denominations) {
    denominationFields[`den_${d}`] = z.preprocess(
      (v) => {
        if (v === '' || v === null || v === undefined) return 0;
        const n = Number(v);
        return isNaN(n) ? 0 : Math.floor(n);
      },
      z.number().int().min(0, 'No puede ser negativo'),
    );
  }

  const schema = z.object({
    date: z.string().min(1, 'Fecha requerida'),
    concept: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    ...denominationFields,
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      notes: '',
      ...Object.fromEntries(denominations.map((d) => [`den_${d}`, 0])),
    },
  });

  // Calcular totales
  const watched = form.watch();
  const totals = denominations.map((d) => ({
    denomination: d,
    quantity: Number(watched[`den_${d}`]) || 0,
    subtotal: d * (Number(watched[`den_${d}`]) || 0),
  }));
  const grandTotal = totals.reduce((s, t) => s + t.subtotal, 0);

  const onSubmit = async (values: FormValues) => {
    if (grandTotal <= 0) {
      showToast.error('Debe ingresar al menos una cantidad en alguna denominación');
      return;
    }

    const denoms = denominations
      .map((d) => ({
        denomination: d,
        quantity: Number(values[`den_${d}`]) || 0,
      }))
      .filter((d) => d.quantity > 0);

    if (denoms.length === 0) {
      showToast.error('Debe ingresar al menos una cantidad');
      return;
    }

    try {
      await createMutation.mutateAsync({
        date: values.date,
        concept: values.concept || 'Cierre de caja',
        denominations: denoms,
        notes: values.notes,
      });
      form.reset();
      showToast.success('Cierre de caja registrado exitosamente');
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  // Format denomination label
  const fmtDenom = (d: number) => {
    if (d >= 1) return `L. ${d}`;
    return `L. ${d.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Registrar Cierre de Caja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDatePicker
                name="date"
                control={form.control as any}
                label="Fecha del cierre"
              />
              <FormTextArea
                name="concept"
                control={form.control as any}
                label="Concepto (opcional)"
                placeholder="Ej: Cierre de caja dominical"
                rows={1}
              />
            </div>

            {/* Denominaciones */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Billetes y Monedas</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {denominations.map((d) => (
                  <div
                    key={d}
                    className={`rounded-lg border p-3 ${
                      Number(watched[`den_${d}`]) > 0
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{fmtDenom(d)}</span>
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <FormInput
                      name={`den_${d}`}
                      control={form.control as any}
                      label="Cantidad"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                    />
                    {Number(watched[`den_${d}`]) > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        = L. {(d * Number(watched[`den_${d}`])).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">Total Calculado:</span>
                <span className="text-2xl font-bold text-primary">
                  L. {grandTotal.toFixed(2)}
                </span>
              </div>
              {grandTotal > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {totals
                    .filter((t) => t.quantity > 0)
                    .map(
                      (t) =>
                        `${t.quantity} × ${fmtDenom(t.denomination)} = L.${t.subtotal.toFixed(2)}`,
                    )
                    .join(' + ')}
                </div>
              )}
            </div>

            <FormTextArea
              name="notes"
              control={form.control as any}
              label="Notas / Observaciones (opcional)"
              placeholder="Cualquier observación relevante"
              rows={2}
            />

            <div className="flex justify-end pt-4 border-t">
              <FormSubmitButton
                isSubmitting={createMutation.isPending}
                label="Registrar Cierre"
                loadingLabel="Registrando…"
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function CashClosingPage() {
  const { data: denomData, isLoading } = useDenominations();
  const denominations: number[] = denomData?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cierre de Caja</h1>
        <p className="text-muted-foreground">Cargando denominaciones…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cierre de Caja</h1>
      <CashClosingForm denominations={denominations} />
    </div>
  );
}