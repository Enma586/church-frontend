import { Cloud, CloudOff, Clock, AlertTriangle } from 'lucide-react';
import type { SyncStatus } from '../types/appointment.types';

const config: Record<
  SyncStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className: string;
  }
> = {
  synced: {
    icon: Cloud,
    label: 'Sincronizada',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  pending_sync: {
    icon: Clock,
    label: 'Pendiente',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  failed: {
    icon: CloudOff,
    label: 'Fallida',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  orphan: {
    icon: AlertTriangle,
    label: 'Huérfana',
    className:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { icon: Icon, label, className } = config[status] || config.synced;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}