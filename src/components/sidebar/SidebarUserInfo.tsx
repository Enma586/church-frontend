import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

interface SidebarUserInfoProps {
  collapsed: boolean;
}

export function SidebarUserInfo({ collapsed }: SidebarUserInfoProps) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        collapsed && 'justify-center px-2',
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            @{user.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.role}</p>
        </div>
      )}
    </div>
  );
}