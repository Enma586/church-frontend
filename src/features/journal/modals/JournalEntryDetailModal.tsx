import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JournalStatusBadge } from '../components/JournalStatusBadge';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Asiento {entry.voucherNumber}
            <JournalStatusBadge status={entry.status} />
          </DialogTitle>
          <DialogDescription>
            {new Date(entry.date).toLocaleDateString('es-HN', {
              dateStyle: 'long',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <span className="font-semibold text-sm">Concepto:</span>
            <p className="text-sm mt-1">{entry.concept}</p>
          </div>

          <ScrollArea className="max-h-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Cuenta</th>
                  <th className="text-right py-2 font-medium">Débito</th>
                  <th className="text-right py-2 font-medium">Crédito</th>
                  <th className="text-left py-2 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((line, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      {line.accountData
                        ? `${line.accountData.code} — ${line.accountData.name}`
                        : line.account}
                    </td>
                    <td className="text-right py-2 tabular-nums">
                      {line.debit > 0 ? `L. ${line.debit.toFixed(2)}` : ''}
                    </td>
                    <td className="text-right py-2 tabular-nums">
                      {line.credit > 0 ? `L. ${line.credit.toFixed(2)}` : ''}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {line.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td className="py-2">Totales</td>
                  <td className="text-right py-2 tabular-nums">
                    L. {totalDebit.toFixed(2)}
                  </td>
                  <td className="text-right py-2 tabular-nums">
                    L. {totalCredit.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </ScrollArea>

          {canAnular && onAnular && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="destructive"
                onClick={onAnular}
                disabled={isAnulando}
              >
                {isAnulando ? 'Anulando...' : 'Anular Asiento'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}