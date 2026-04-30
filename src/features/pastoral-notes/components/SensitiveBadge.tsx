import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props { isSensitive: boolean; }

export function SensitiveBadge({ isSensitive }: Props) {
  if (isSensitive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
        <ShieldAlert className="h-3 w-3" /> Sensible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <ShieldCheck className="h-3 w-3" /> Normal
    </span>
  );
}