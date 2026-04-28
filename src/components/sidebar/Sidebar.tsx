import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarUserInfo } from './SidebarUserInfo';
import { SidebarFooter } from './SidebarFooter';
import { SidebarCollapseToggle } from './SidebarCollapseToggle';
import { SidebarMobileOverlay } from './SidebarMobileOverlay';

export function Sidebar() {
  const collapsed = useAppSelector((s) => s.sidebar.isCollapsed);

  const content = (
    <aside
      className={cn(
        'flex h-full flex-col bg-sidebar',
        collapsed ? 'w-16' : 'w-64',
        'transition-[width] duration-200 ease-in-out',
      )}
    >
      <SidebarHeader collapsed={collapsed}>
        <SidebarCollapseToggle />
        {!collapsed && <h1 className="text-lg font-bold text-sidebar-foreground">Iglesia Young</h1>}
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarNavigation collapsed={collapsed} />
      </ScrollArea>

      <SidebarFooter collapsed={collapsed}>
        <SidebarUserInfo collapsed={collapsed} />
      </SidebarFooter>
    </aside>
  );

  return (
    <>
      {/* Escritorio: sidebar fijo visible */}
      <div className="hidden lg:block h-full">{content}</div>

      {/* Móvil: sidebar dentro de un Sheet */}
      <div className="lg:hidden">
        <SidebarMobileOverlay>{content}</SidebarMobileOverlay>
      </div>
    </>
  );
}