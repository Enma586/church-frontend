import { cn } from '@/lib/utils';

interface TableToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function TableToolbar({ children, className }: TableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-2 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}