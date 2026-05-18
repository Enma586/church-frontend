import { cn } from '@/lib/utils';

interface Props {
  value: number;
  className?: string;
}

/** Formats a number as Honduran Lempira with conditional red/green coloring. */
export function BalanceDisplay({ value, className }: Props) {
  const formatted = `L. ${Math.abs(value).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        value > 0 && 'text-green-600 dark:text-green-400',
        value < 0 && 'text-red-600 dark:text-red-400',
        value === 0 && 'text-muted-foreground',
        className,
      )}
    >
      {value < 0 ? `(${formatted})` : formatted}
    </span>
  );
}