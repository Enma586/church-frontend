import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCollapse } from '@/store/slices/sidebarSlice';

export function SidebarCollapseToggle() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.sidebar.isCollapsed);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => dispatch(toggleCollapse())}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {collapsed ? 'Expandir menú' : 'Colapsar menú'}
      </TooltipContent>
    </Tooltip>
  );
}