import { EmptyState } from '@/components/feedback/EmptyState';
import { Inbox } from 'lucide-react';

interface TableEmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmpty({
  title = 'Sin resultados',
  description = 'No se encontraron registros con los filtros actuales.',
  action,
}: TableEmptyProps) {
  return (
    <EmptyState
      icon={Inbox}
      title={title}
      description={description}
      action={action}
      className="py-12"
    />
  );
}