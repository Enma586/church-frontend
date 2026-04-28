import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeMobile } from '@/store/slices/sidebarSlice';

interface SidebarMobileOverlayProps {
  children: React.ReactNode;
}

export function SidebarMobileOverlay({ children }: SidebarMobileOverlayProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.sidebar.isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) dispatch(closeMobile()); }}>
      <SheetContent side="left" className="w-64 p-0">
        {children}
      </SheetContent>
    </Sheet>
  );
}