import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNavItem, type NavItemData } from './SidebarNavItem';

export interface NavGroupData {
  label: string;
  icon: LucideIcon;
  items: NavItemData[];
  roles?: string[];
}

interface SidebarNavGroupProps {
  group: NavGroupData;
  collapsed: boolean;
}

export function SidebarNavGroup({ group, collapsed }: SidebarNavGroupProps) {
  const [open, setOpen] = useState(false);

  if (collapsed) {
    return null;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        )}
      >
        <group.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate text-left font-medium">{group.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
          {group.items.map((item) => (
            <SidebarNavItem key={item.path} item={item} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
}