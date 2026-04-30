import { User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  const memberName =
    typeof user.memberId === 'object' && user.memberId
      ? user.memberId.fullName
      : null;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <UserIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">@{user.username}</p>
          {memberName && (
            <p className="text-sm text-muted-foreground truncate">{memberName}</p>
          )}
        </div>
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </CardContent>
    </Card>
  );
}