import { cn } from '@/lib/utils';

interface TableFiltersProps {
  children: React.ReactNode;
  className?: string;
}

export function TableFilters({ children, className }: TableFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      {children}
    </div>
  );
}