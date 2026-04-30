import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/constants';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant={role === 'Coordinador' ? 'default' : 'secondary'}>
      {role}
    </Badge>
  );
}