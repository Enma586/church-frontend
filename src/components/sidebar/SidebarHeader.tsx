import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  children?: React.ReactNode;
}

export function SidebarHeader({ collapsed, children }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-sidebar-border',
        collapsed && 'justify-center px-2',
      )}
    >
      {children || (
        <h1
          className={cn(
            'text-lg font-bold text-sidebar-foreground truncate',
            collapsed && 'hidden',
          )}
        >
          App
        </h1>
      )}
    </div>
  );
}