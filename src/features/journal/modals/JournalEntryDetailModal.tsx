import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JournalStatusBadge } from '../components/JournalStatusBadge';
import { Badge } from '@/components/ui/badge';
import { User, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { JournalEntry, JournalType } from '@/types';

const TYPE_CONFIG: Record<
  JournalType,
  { icon: typeof ArrowUpRight; color: string; bg: string; border: string }
> = {
  Ingreso: {
    icon: ArrowUpRight,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-l-green-500',
  },
  Egreso: {
    icon: ArrowDownRight,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
  },
};

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
  const config = TYPE_CONFIG[entry.type];
  const TypeIcon = config.icon;

  const createdBy =
    entry.createdByData?.username ??
    (typeof entry.createdBy === 'object' && entry.createdBy !== null ? entry.createdBy.username : '—');

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

  const accountCode = entry.accountData?.code ?? (typeof entry.account === 'object' && entry.account !== null ? entry.account.code : '—');
  const accountName = entry.accountData?.name ?? (typeof entry.account === 'object' && entry.account !== null ? entry.account.name : '—');
  const productName = entry.productData?.name ?? (typeof entry.product === 'object' && entry.product !== null ? entry.product.name : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0"
        aria-describedby={undefined}
      >
        {/* CABECERA */}
        <div className="shrink-0 px-4 sm:px-6 pt-6 pb-5 border-b">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${config.bg}`}>
                <TypeIcon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <DialogTitle className="text-xl font-bold">
                    {entry.type} — {entry.voucherNumber}
                  </DialogTitle>
                  <Badge className={entry.type === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {entry.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <JournalStatusBadge status={entry.status} />
              <Separator orientation="vertical" className="hidden sm:block h-5" />
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {createdBy}
              </span>
              <Separator orientation="vertical" className="hidden sm:block h-5" />
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formattedCreatedAt}
              </span>
            </div>
          </div>
        </div>

        {/* CONCEPTO */}
        <div className="shrink-0 px-4 sm:px-6 py-4 border-b bg-muted/20">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Concepto
          </h3>
          <p className="text-base leading-relaxed">{entry.concept}</p>
        </div>

        {/* DETALLES */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 py-4 space-y-4">
          <Card className={`overflow-hidden border-l-4 ${config.border}`}>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-0">
                <div className="px-4 py-4 border-r">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cuenta</p>
                  <p className="font-mono font-bold text-sm">{accountCode}</p>
                  <p className="text-sm text-muted-foreground">{accountName}</p>
                </div>
                <div className="px-4 py-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monto</p>
                  <p className={`text-lg font-bold ${config.color}`}>
                    L. {entry.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {productName && (
            <div className="text-sm">
              <span className="text-muted-foreground">Producto: </span>
              <span className="font-medium">{productName}</span>
            </div>
          )}
        </div>

        {/* TOTAL */}
        <div className="shrink-0 border-t bg-muted/30 px-4 sm:px-6 py-4">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {entry.type === 'Ingreso' ? 'Ingreso' : 'Egreso'}
              </p>
              <p className={`text-2xl font-bold ${config.color}`}>
                L. {entry.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* ANULAR */}
        {canAnular && onAnular && (
          <div className="shrink-0 flex items-center justify-end px-4 sm:px-6 py-4 border-t bg-background gap-3">
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