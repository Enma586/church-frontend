import { Badge } from '@/components/ui/badge';
import type { JournalStatus } from '@/types';

const STATUS_STYLES: Record<JournalStatus, string> = {
  Valido: 'bg-green-100 text-green-800',
  Anulado: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<JournalStatus, string> = {
  Valido: 'Válido',
  Anulado: 'Anulado',
};

interface Props {
  status: JournalStatus;
}

export function JournalStatusBadge({ status }: Props) {
  return (
    <Badge className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}