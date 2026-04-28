import { useAppSelector } from '@/store/hooks';
import { NavbarThemeToggle } from './NavbarThemeToggle';
//import { NavbarNotifications } from './NavbarNotifications';
import { NavbarNotificationPanel } from './NavbarNotificationPanel';
import { NavbarUserMenu } from './NavbarUserMenu';
import { NavbarGuestButtons } from './NavbarGuestButtons';

export function NavbarActions() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div className="flex items-center gap-1">
      <NavbarThemeToggle />
      {isAuthenticated ? (
        <>
          <NavbarNotificationPanel />
          <NavbarUserMenu />
        </>
      ) : (
        <NavbarGuestButtons />
      )}
    </div>
  );
}