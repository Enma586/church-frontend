import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ReportSummaryCard } from '../components/ReportSummaryCard';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { AccountTreeSelect } from '@/features/accounts/components/AccountTreeSelect';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useLedger } from '../hooks/useLedger';
import { useTrialBalance } from '../hooks/useTrialBalance';
import { useBalanceSheet } from '../hooks/useBalanceSheet';
import { useIncomeStatement } from '../hooks/useIncomeStatement';
import { TablePagination } from '@/components/tables/TablePagination';
import { usePagination } from '@/hooks/usePagination';
import { usePermissions } from '@/hooks/usePermissions';
import { useReopenPeriod } from '@/features/period/hooks/usePeriodMutations';
import { ClosePeriodModal } from '@/features/period/modals/ClosePeriodModal';
import { reportsService } from '../services/reports.service';
import { FilterDateRange } from '@/components/filters/FilterDateRange';
import { Loader2, Lock, Unlock, FileDown, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { showToast } from '@/lib/toast';

// ─── Helpers para extraer datos de forma segura sin doble .data ──────────────
function useLedgerData() {
  const { page, limit, goToPage, setPerPage } = usePagination();
  const form = useForm({ defaultValues: { accountId: '' } });
  const accountId = form.watch('accountId');

  const { data, isLoading } = useLedger({ accountId, page, limit });

  const response = data?.data; // LedgerResponse | undefined
  const rows = response?.data ?? [];
  const pagination = response?.pagination;
  const account = response?.account;

  return { form, accountId, rows, pagination, account, isLoading, page, limit, goToPage, setPerPage };
}

function useTrialBalanceData() {
  const { data, isLoading } = useTrialBalance();
  const response = data?.data; // TrialBalanceResponse | undefined
  const rows = response?.data ?? [];
  const totals = response?.totals;
  return { rows, totals, isLoading };
}

function useBalanceSheetData() {
  const { data, isLoading } = useBalanceSheet();
  const response = data?.data; // BalanceSheetResponse | undefined
  const sheet = response?.data;
  const totals = response?.totals;
  return { sheet, totals, isLoading };
}

function useIncomeStatementData() {
  const { data, isLoading } = useIncomeStatement();
  const response = data?.data; // IncomeStatementResponse | undefined
  const stmt = response?.data;
  const totals = response?.totals;
  return { stmt, totals, isLoading };
}

// ─── Libro Mayor ──────────────────────────────────────────────────────────────
function LedgerTab() {
  const {
    form,
    accountId,
    rows,
    pagination,
    account,
    isLoading,
    goToPage,
    setPerPage,
  } = useLedgerData();

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Form {...form}>
          <AccountTreeSelect
            name="accountId"
            control={form.control}
            label="Seleccione una cuenta"
            mode="transaction"
          />
        </Form>
      </div>

      {!accountId && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Seleccione una cuenta para ver su Libro Mayor.
        </p>
      )}

      {accountId && isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {accountId && !isLoading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin movimientos para esta cuenta en el período actual.
        </p>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Libro Mayor — {account?.code} {account?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 font-medium">Fecha</th>
                    <th className="py-2 font-medium">Comprobante</th>
                    <th className="py-2 font-medium">Tipo</th>
                    <th className="py-2 font-medium">Concepto</th>
                    <th className="py-2 text-right font-medium">Monto</th>
                    <th className="py-2 text-right font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5">
                        {new Date(row.date).toLocaleDateString('es-HN')}
                      </td>
                      <td className="py-1.5 font-mono text-xs">
                        {row.voucherNumber}
                      </td>
                      <td className="py-1.5">
                        {row.type === 'Ingreso' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                            <ArrowUpRight className="h-3 w-3" />
                            Ingreso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                            <ArrowDownRight className="h-3 w-3" />
                            Egreso
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 max-w-48 truncate">
                        {row.concept}
                      </td>
                      <td
                        className={`py-1.5 text-right tabular-nums font-medium ${
                          row.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {row.type === 'Ingreso' ? '+' : '−'} L. {row.amount.toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right">
                        <BalanceDisplay value={row.balance} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={goToPage}
          onLimitChange={setPerPage}
        />
      )}
    </div>
  );
}

// ─── Balanza de Comprobación ─────────────────────────────────────────────────
function TrialBalanceTab() {
  const { rows, totals, isLoading } = useTrialBalanceData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos para el período actual.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportSummaryCard title="Total Ingresos" value={totals?.totalIngresos ?? 0} variant="success" />
        <ReportSummaryCard title="Total Egresos" value={totals?.totalEgresos ?? 0} variant="danger" />
        <ReportSummaryCard
          title="Saldo Neto"
          value={totals?.saldoNeto ?? 0}
          variant={(totals?.saldoNeto ?? 0) >= 0 ? 'success' : 'danger'}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium">Código</th>
                  <th className="py-2 font-medium">Cuenta</th>
                  <th className="py-2 font-medium">Tipo</th>
                  <th className="py-2 text-right font-medium">Ingresos</th>
                  <th className="py-2 text-right font-medium">Egresos</th>
                  <th className="py-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.accountId} className="border-b last:border-0">
                    <td className="py-1.5">{row.code}</td>
                    <td className="py-1.5">{row.name}</td>
                    <td className="py-1.5">{row.type}</td>
                    <td className="py-1.5 text-right tabular-nums text-green-600">
                      {row.totalIngresos > 0 ? row.totalIngresos.toFixed(2) : '—'}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-red-600">
                      {row.totalEgresos > 0 ? row.totalEgresos.toFixed(2) : '—'}
                    </td>
                    <td className="py-1.5 text-right">
                      <BalanceDisplay value={row.balance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Balance General ─────────────────────────────────────────────────────────
function BalanceSheetTab() {
  const { sheet, totals, isLoading } = useBalanceSheetData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportSummaryCard title="Activo" value={totals?.activo ?? 0} variant="success" />
        <ReportSummaryCard title="Pasivo" value={totals?.pasivo ?? 0} variant="danger" />
        <ReportSummaryCard title="Pasivo + Patrimonio" value={totals?.pasivoPatrimonio ?? 0} />
      </div>

      {totals && (
        <p className="text-sm text-center font-medium">
          {totals.balanceado
            ? '✓ Balance General Cuadrado'
            : '⚠ Desbalance detectado — revise los asientos contables'}
        </p>
      )}

      {(['activo', 'pasivo', 'patrimonio'] as const).map((section) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium">Código</th>
                  <th className="py-2 font-medium">Cuenta</th>
                  <th className="py-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {sheet[section].map((row) => (
                  <tr key={row.accountId} className="border-b last:border-0">
                    <td className="py-1.5">{row.code}</td>
                    <td className="py-1.5">{row.name}</td>
                    <td className="py-1.5 text-right">
                      <BalanceDisplay value={row.balance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Estado de Resultados ────────────────────────────────────────────────────
function IncomeStatementTab() {
  const { stmt, totals, isLoading } = useIncomeStatementData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!stmt) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos disponibles.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportSummaryCard title="Ingresos" value={totals?.ingresos ?? 0} variant="success" />
        <ReportSummaryCard title="Gastos" value={totals?.gastos ?? 0} variant="danger" />
        <ReportSummaryCard
          title="Resultado Neto"
          value={totals?.resultadoNeto ?? 0}
          variant={(totals?.resultadoNeto ?? 0) >= 0 ? 'success' : 'danger'}
        />
      </div>

      {(['ingresos', 'gastos'] as const).map((section) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium">Código</th>
                  <th className="py-2 font-medium">Cuenta</th>
                  <th className="py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {stmt[section].map((row) => (
                  <tr key={row.accountId} className="border-b last:border-0">
                    <td className="py-1.5">{row.code}</td>
                    <td className="py-1.5">{row.name}</td>
                    <td className="py-1.5 text-right">
                      <BalanceDisplay value={row.balance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Exportar PDF ────────────────────────────────────────────────────────
function ExportPDFSection() {
  const [exporting, setExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleExport = useCallback(async () => {
    if (!dateFrom) return;
    const to = dateTo || dateFrom;
    setExporting(true);
    try {
      await reportsService.exportJournalPDF({
        dateFrom,
        dateTo: to,
      });
      showToast.success('PDF generado exitosamente');
    } catch {
      showToast.error('Error al generar el PDF');
    } finally {
      setExporting(false);
    }
  }, [dateFrom, dateTo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Exportar Libro Diario a PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <FilterDateRange
              label="Rango de fechas"
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
            <Button
              size="sm"
              onClick={handleExport}
              disabled={exporting || !dateFrom}
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <FileDown className="mr-1 h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
          {!dateFrom && (
            <p className="text-xs text-muted-foreground">
              Seleccione una fecha para generar el PDF. Use el mismo día
              para un reporte diario.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { can } = usePermissions();
  const reopenMutation = useReopenPeriod();
  const [closeOpen, setCloseOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reportes Financieros</h1>
        {can('accounting:write') && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCloseOpen(true)}>
              <Lock className="mr-1 h-4 w-4" />
              Cerrar Período
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reopenMutation.mutate()}
              disabled={reopenMutation.isPending}
            >
              <Unlock className="mr-1 h-4 w-4" />
              {reopenMutation.isPending ? 'Reabriendo…' : 'Reabrir Período'}
            </Button>
          </div>
        )}
      </div>

      {/* ── Export PDF ── */}
      <ExportPDFSection />

      <Tabs defaultValue="trial-balance" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="ledger">Libro Mayor</TabsTrigger>
          <TabsTrigger value="trial-balance">Balanza</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance General</TabsTrigger>
          <TabsTrigger value="income-statement">Est. Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          <LedgerTab />
        </TabsContent>
        <TabsContent value="trial-balance" className="mt-4">
          <TrialBalanceTab />
        </TabsContent>
        <TabsContent value="balance-sheet" className="mt-4">
          <BalanceSheetTab />
        </TabsContent>
        <TabsContent value="income-statement" className="mt-4">
          <IncomeStatementTab />
        </TabsContent>
      </Tabs>

      <ClosePeriodModal open={closeOpen} onOpenChange={setCloseOpen} />
    </div>
  );
}