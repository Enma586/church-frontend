import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { toggleMobile } from '@/store/slices/sidebarSlice';
import { NavbarLogo } from './NavbarLogo';
import { NavbarActions } from './NavbarActions';

export function Navbar() {
  const dispatch = useAppDispatch();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Botón hamburguesa solo visible en móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => dispatch(toggleMobile())}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <NavbarLogo />
        </div>
        <NavbarActions />
      </div>
    </header>
  );
}