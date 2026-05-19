import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { FormModal } from '@/components/modals/FormModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/tables/DataTable';
import { TablePagination } from '@/components/tables/TablePagination';
import { usePagination } from '@/hooks/usePagination';
import { useDenominations, useCashClosings } from '../hooks/useCashClosings';
import { useCreateCashClosing } from '../hooks/useCashClosingMutations';
import { reportsService } from '@/features/reports/services/reports.service';
import { showToast } from '@/lib/toast';
import { humanizeError } from '@/lib/error-messages';
import { cn } from '@/lib/utils';
import {
  Calculator,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Wallet,
  ScrollText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { CashClosing } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

// ─────────────────────────────────────────────────────────────────────────────
// Modal de Nuevo Cierre de Caja (3 pasos)
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ['Consultar saldo', 'Conteo físico', 'Verificar'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-colors',
              i < current
                ? 'bg-primary text-primary-foreground border-primary'
                : i === current
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-muted-foreground/30 text-muted-foreground',
            )}
          >
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={cn(
              'text-xs font-medium hidden sm:inline',
              i <= current ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}

function NewClosingModal({
  open,
  onOpenChange,
  denominations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  denominations: number[];
}) {
  const [step, setStep] = useState(0);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [cashBalance, setCashBalance] = useState<{
    totalIngresos: number;
    totalEgresos: number;
    saldoNeto: number;
    count: number;
    dateFrom: string | null;
    dateTo: string | null;
  } | null>(null);

  const createMutation = useCreateCashClosing();

  // ── Schema del formulario ──────────────────────────────────
  const denominationFields: Record<string, z.ZodTypeAny> = {};
  for (const d of denominations) {
    denominationFields[`den_${d}`] = z.preprocess(
      (v) => {
        if (v === '' || v === null || v === undefined) return 0;
        const n = Number(v);
        return isNaN(n) ? 0 : Math.floor(n);
      },
      z.number().int().min(0),
    );
  }

  const schema = z.object({
    date: z.string().min(1, 'Fecha requerida'),
    concept: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    balanceDateFrom: z.string().optional(),
    balanceDateTo: z.string().optional(),
    ...denominationFields,
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      concept: '',
      notes: '',
      balanceDateFrom: '',
      balanceDateTo: '',
      ...Object.fromEntries(denominations.map((d) => [`den_${d}`, 0])),
    },
  });

  // ── Cálculos ───────────────────────────────────────────────
  const watched = form.watch();
  const totals = denominations.map((d) => ({
    denomination: d,
    quantity: Number(watched[`den_${d}`]) || 0,
    subtotal: d * (Number(watched[`den_${d}`]) || 0),
  }));
  const grandTotal = totals.reduce((s, t) => s + t.subtotal, 0);

  const expectedBalance = cashBalance?.saldoNeto ?? null;
  const isMatched =
    expectedBalance !== null && Math.abs(grandTotal - expectedBalance) < 0.005;
  const difference =
    expectedBalance !== null ? grandTotal - expectedBalance : 0;

  const bills = denominations.filter((d) => d >= 1);

  const fmtDenom = (d: number) => `L. ${d}`;

  // ── Handlers ───────────────────────────────────────────────
  const fetchBalance = async () => {
    const vals = form.getValues();
    setFetchingBalance(true);
    try {
      const response = await reportsService.getCashBalance({
        dateFrom: vals.balanceDateFrom || undefined,
        dateTo: vals.balanceDateTo || undefined,
      });
      setCashBalance(response.data ?? null);
    } catch {
      showToast.error('Error al obtener el saldo del sistema');
      setCashBalance(null);
    } finally {
      setFetchingBalance(false);
    }
  };

  const goToStep2 = () => {
    if (!cashBalance) {
      showToast.error('Primero consulte el saldo del sistema');
      return;
    }
    setStep(1);
  };

  const onSubmit = async (values: FormValues) => {
    if (!isMatched) return;

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
      setCashBalance(null);
      setStep(0);
      onOpenChange(false);
    } catch (error) {
      showToast.error(humanizeError(error));
    }
  };

  const handleClose = () => {
    setStep(0);
    setCashBalance(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <FormModal
      open={open}
      onOpenChange={handleClose}
      title="Nuevo Cierre de Caja"
      description="Complete los 3 pasos para registrar el arqueo"
      size="5xl"
    >
      <StepIndicator current={step} />

      {/* ═══ PASO 1: Consultar saldo ════════════════════ */}
      {step === 0 && (
        <Form {...form}>
          <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seleccione el rango de fechas del período que desea auditar y
            consulte el saldo que registra el sistema contable.
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <FormDatePicker
              name="balanceDateFrom"
              control={form.control as any}
              label="Desde"
            />
            <FormDatePicker
              name="balanceDateTo"
              control={form.control as any}
              label="Hasta"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={fetchBalance}
              disabled={fetchingBalance}
            >
              {fetchingBalance ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Consultando…
                </>
              ) : (
                <>
                  <Calculator className="mr-1 h-4 w-4" />
                  Consultar saldo
                </>
              )}
            </Button>
          </div>

          {cashBalance && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Ingresos
                    </p>
                    <p className="text-lg font-bold text-green-600 tabular-nums">
                      L. {cashBalance.totalIngresos.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Egresos
                    </p>
                    <p className="text-lg font-bold text-red-600 tabular-nums">
                      L. {cashBalance.totalEgresos.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Saldo esperado
                    </p>
                    <p
                      className={cn(
                        'text-lg font-bold tabular-nums',
                        cashBalance.saldoNeto >= 0
                          ? 'text-green-600'
                          : 'text-red-600',
                      )}
                    >
                      L. {cashBalance.saldoNeto.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Movimientos
                    </p>
                    <p className="text-lg font-bold tabular-nums">
                      {cashBalance.count}
                    </p>
                  </div>
                </div>
                {(cashBalance.dateFrom || cashBalance.dateTo) && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Rango:{' '}
                    {cashBalance.dateFrom
                      ? new Date(cashBalance.dateFrom).toLocaleDateString('es-HN')
                      : 'Inicio'}
                    {' — '}
                    {cashBalance.dateTo
                      ? new Date(cashBalance.dateTo).toLocaleDateString('es-HN')
                      : 'Hoy'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={goToStep2}>
              Siguiente: Conteo físico
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          </div>
        </Form>
      )}

      {/* ═══ PASO 2: Conteo físico ═══════════════════════ */}
      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => setStep(2))} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDatePicker
                name="date"
                control={form.control as any}
                label="Fecha del cierre"
              />
              <FormTextArea
                name="concept"
                control={form.control as any}
                label="Concepto"
                placeholder="Ej: Cierre de caja dominical"
                rows={1}
              />
            </div>

            <Separator />

            {bills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                  Billetes
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {bills.map((d) => {
                    const qty = Number(watched[`den_${d}`]) || 0;
                    return (
                      <div
                        key={d}
                        className={cn(
                          'rounded-lg border p-3 transition-colors',
                          qty > 0 ? 'border-primary bg-primary/5' : '',
                        )}
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
                        {qty > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 text-right tabular-nums">
                            = L. {(d * qty).toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total parcial */}
            <div
              className={cn(
                'rounded-lg border p-4',
                grandTotal > 0 ? 'border-primary bg-primary/5' : '',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total contado:</span>
                <span className="text-xl font-bold tabular-nums">
                  L. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Saldo esperado (recordatorio mientras cuenta) */}
            {expectedBalance !== null && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Saldo esperado (sistema):
                  </span>
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      Math.abs(grandTotal - expectedBalance) < 0.005
                        ? 'text-green-600'
                        : 'text-red-600',
                    )}
                  >
                    L. {expectedBalance.toFixed(2)}
                  </span>
                </div>
                {grandTotal > 0 && Math.abs(grandTotal - expectedBalance) >= 0.005 && (
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    Diferencia: {grandTotal > expectedBalance ? '+' : ''}
                    L. {(grandTotal - expectedBalance).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Atrás
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (grandTotal <= 0) {
                    showToast.error('Ingrese al menos una cantidad');
                    return;
                  }
                  setStep(2);
                }}
              >
                Siguiente: Verificar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* ═══ PASO 3: Verificación y cierre ════════════════ */}
      {step === 2 && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <div className="space-y-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Total contado (físico)
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        L. {grandTotal.toFixed(2)}
                      </p>
                    </div>
                    <Wallet className="h-10 w-10 text-primary/30" />
                  </div>
                  {grandTotal > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {totals
                        .filter((t) => t.quantity > 0)
                        .map((t) => `${t.quantity} × ${fmtDenom(t.denomination)}`)
                        .join(' + ')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {expectedBalance !== null && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Saldo esperado (sistema)
                        </p>
                        <p className="text-xl font-bold tabular-nums">
                          L. {expectedBalance.toFixed(2)}
                        </p>
                      </div>
                      <Calculator className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {expectedBalance !== null && (
                <div
                  className={cn(
                    'rounded-xl border-2 p-5',
                    isMatched
                      ? 'border-green-400 bg-green-50'
                      : 'border-red-400 bg-red-50',
                  )}
                >
                  {isMatched ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-green-700">
                          ¡Cuadre perfecto!
                        </p>
                        <p className="text-sm text-green-600">
                          El conteo físico coincide con el saldo del sistema.
                          Puede registrar el cierre.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-red-700">
                          Diferencia de L. {Math.abs(difference).toFixed(2)}
                        </p>
                        <p className="text-sm text-red-600">
                          {grandTotal > expectedBalance
                            ? 'El conteo físico excede el saldo esperado.'
                            : 'El conteo físico está por debajo del saldo esperado.'}{' '}
                          Ajuste las cantidades antes de continuar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <FormTextArea
              name="notes"
              control={form.control as any}
              label="Notas / Observaciones"
              placeholder="Alguna observación relevante sobre este cierre"
              rows={2}
            />

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <FormSubmitButton
                isSubmitting={createMutation.isPending}
                label="Registrar Cierre de Caja"
                loadingLabel="Registrando…"
                disabled={!isMatched}
              />
            </div>
          </form>
        </Form>
      )}
    </FormModal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de últimos cierres
// ─────────────────────────────────────────────────────────────────────────────

function RecentClosingsTable({ }: { onNew: () => void }) {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const { data, isLoading } = useCashClosings({ page, limit });

  const closings = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnDef<CashClosing>[] = [
    {
      header: 'Referencia',
      accessorKey: 'reference',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold">
          {getValue() as string}
        </span>
      ),
    },
    {
      header: 'Fecha',
      accessorKey: 'date',
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString('es-HN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      header: 'Concepto',
      accessorKey: 'concept',
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v.length > 30 ? `${v.slice(0, 30)}…` : v;
      },
    },
    {
      header: 'Total Contado',
      accessorKey: 'totalCalculated',
      cell: ({ getValue }) => (
        <span className="font-mono tabular-nums font-semibold text-sm">
          L. {(getValue() as number).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Diferencia',
      accessorKey: 'difference',
      cell: ({ getValue }) => {
        const diff = getValue() as number;
        return (
          <span
            className={cn(
              'font-mono tabular-nums text-sm font-semibold',
              Math.abs(diff) < 0.005 ? 'text-green-600' : 'text-red-600',
            )}
          >
            {Math.abs(diff) < 0.005
              ? 'L. 0.00'
              : `${diff > 0 ? '+' : ''}L. ${diff.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      header: 'Creado por',
      accessorFn: (row) => {
        const createdBy = row.createdBy;
        return typeof createdBy === 'object' && createdBy !== null
          ? createdBy.username
          : '—';
      },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {getValue() as string}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          Historial de cierres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={closings}
          loading={isLoading}
          emptyTitle="Sin cierres registrados"
          emptyDescription="Registre su primer cierre de caja usando el botón «Nuevo cierre»."
        />
        {pagination && (
          <TablePagination
            pagination={pagination}
            onPageChange={goToPage}
            onLimitChange={setPerPage}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────

export default function CashClosingPage() {
  const { data: denomData, isLoading } = useDenominations();
  const denominations: number[] = denomData?.data ?? [];
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Cierre de Caja</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cierre de Caja</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cierre
        </Button>
      </div>

      <RecentClosingsTable onNew={() => setModalOpen(true)} />

      <NewClosingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        denominations={denominations}
      />
    </div>
  );
}
