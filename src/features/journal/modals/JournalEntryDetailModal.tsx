import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JournalStatusBadge } from '../components/JournalStatusBadge';
import {
  Scale,
  User,
  Clock,
  Receipt,
} from 'lucide-react';
import type { JournalEntry } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry;
  canAnular: boolean;
  onAnular?: () => void;
  isAnulando?: boolean;
}

export function JournalEntryDetailModal({
  open,
  onOpenChange,
  entry,
  canAnular,
  onAnular,
  isAnulando,
}: Props) {
  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const createdBy =
    entry.createdByData?.username ??
    (typeof entry.createdBy === 'object' ? entry.createdBy.username : '—');

  const formattedDate = new Date(entry.date).toLocaleDateString('es-HN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedCreatedAt = new Date(entry.createdAt).toLocaleDateString(
    'es-HN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* FIX 2: aria-describedby={undefined} para silenciar el warning de Radix UI */}
      <DialogContent 
        className="w-[95vw] sm:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0"
        aria-describedby={undefined}
      >

        {/* ═══ CABECERA ═══════════════════════════════════════════ */}
        <div className="shrink-0 px-4 sm:px-6 md:px-8 pt-6 pb-5 border-b">
          <div className="space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                {/* FIX 1: Badge de balanceado movido junto al título para mejor lectura */}
                <div className="flex flex-wrap items-center gap-3">
                  <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">
                    Asiento {entry.voucherNumber}
                  </DialogTitle>
                  
                  {balanced ? (
                    <Badge
                      variant="default"
                      className="text-xs sm:text-sm px-2.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300"
                    >
                      <Scale className="h-3.5 w-3.5 mr-1.5" />
                      Balanceado
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="text-xs sm:text-sm px-2.5 py-0.5"
                    >
                      <Scale className="h-3.5 w-3.5 mr-1.5" />
                      Descuadrado
                    </Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <JournalStatusBadge status={entry.status} />
              <Separator orientation="vertical" className="hidden sm:block h-5" />
              <span className="text-sm sm:text-base text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {createdBy}
              </span>
              <Separator orientation="vertical" className="hidden sm:block h-5" />
              <span className="text-sm sm:text-base text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formattedCreatedAt}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ CONCEPTO ════════════════════════════════════════════ */}
        <div className="shrink-0 px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b bg-muted/20">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3">
            Concepto
          </h3>
          <p className="text-base sm:text-lg leading-relaxed">{entry.concept}</p>
        </div>

        {/* ═══ LÍNEAS DEL ASIENTO ══════════════════════════════════ */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4">
            Líneas contables ({entry.lines.length})
          </h3>

          <ScrollArea className="h-full max-h-[35vh] pr-3 sm:pr-4">
            <div className="space-y-3 sm:space-y-4">
              {entry.lines.map((line, i) => {
                const hasDebit = line.debit > 0;
                const hasCredit = line.credit > 0;
                const code = line.accountData?.code ?? line.account;
                const name = line.accountData?.name ?? '';

                return (
                  <Card
                    key={i}
                    className="overflow-hidden border-l-4 border-l-primary/60"
                  >
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 md:grid-cols-12 gap-0">
                        <div className="col-span-2 md:col-span-4 px-4 py-3 sm:px-5 sm:py-4 border-b md:border-b-0 md:border-r">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-1.5">
                            Cuenta
                          </p>
                          <p className="text-sm sm:text-base md:text-lg font-mono font-bold tabular-nums">
                            {code}
                          </p>
                          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                            {name}
                          </p>
                        </div>
                        <div className="col-span-1 md:col-span-2 px-4 py-3 sm:px-5 sm:py-4 border-b border-r md:border-b-0 md:border-r">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-1.5">
                            Débito
                          </p>
                          {hasDebit ? (
                            <p className="text-sm sm:text-base md:text-lg font-bold tabular-nums text-green-600 dark:text-green-400">
                              L. {line.debit.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/30 tabular-nums">
                              —
                            </p>
                          )}
                        </div>
                        <div className="col-span-1 md:col-span-2 px-4 py-3 sm:px-5 sm:py-4 border-b md:border-b-0 md:border-r">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-1.5">
                            Crédito
                          </p>
                          {hasCredit ? (
                            <p className="text-sm sm:text-base md:text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                              L. {line.credit.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/30 tabular-nums">
                              —
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 md:col-span-4 px-4 py-3 sm:px-5 sm:py-4">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-1.5">
                            Descripción
                          </p>
                          <p className="text-xs sm:text-sm md:text-base line-clamp-2">
                            {line.description || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* ═══ TOTALES ════════════════════════════════════════════ */}
        <div className="shrink-0 border-t bg-muted/30 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-6 sm:gap-x-12 gap-y-4">
            <div className="text-left sm:text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                Total Débito
              </p>
              <p className="text-lg sm:text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
                L. {totalDebit.toFixed(2)}
              </p>
            </div>

            <div className="text-left sm:text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                Total Crédito
              </p>
              <p className="text-lg sm:text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                L. {totalCredit.toFixed(2)}
              </p>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-10 sm:h-12" />

            <div className="w-full sm:w-auto text-center sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                Diferencia
              </p>
              <p
                className={`text-lg sm:text-2xl font-bold tabular-nums ${
                  balanced
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-destructive'
                }`}
              >
                {balanced
                  ? 'L. 0.00'
                  : `L. ${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ ANULAR ══════════════════════════════════════════════ */}
        {canAnular && onAnular && (
          <div className="shrink-0 flex items-center justify-end px-4 sm:px-6 md:px-8 py-4 border-t bg-background gap-3">
            <Button
              variant="destructive"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onAnular}
              disabled={isAnulando}
            >
              {isAnulando ? 'Anulando…' : 'Anular Asiento'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}