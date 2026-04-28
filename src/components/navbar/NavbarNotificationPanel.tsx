import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markAllAsRead, removeNotification } from '@/store/slices/notificationSlice';
import { cn } from '@/lib/utils';

export function NavbarNotificationPanel() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notificaciones</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => dispatch(markAllAsRead())}
            >
              Marcar todas leídas
            </Button>
          )}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          <ScrollArea className="max-h-300px">
            {notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent',
                  !n.read && 'bg-accent',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.read && 'font-medium')}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString('es-HN')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => dispatch(removeNotification(n.id))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}