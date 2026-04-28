import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

interface NavbarNotificationsProps {
  onClick: () => void;
}

export function NavbarNotifications({ onClick }: NavbarNotificationsProps) {
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="relative" aria-label="Notificaciones">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}