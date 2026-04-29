import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Member } from '@/types';

interface MemberCardProps {
  member: Member;
  onClick?: (member: Member) => void;
}

/**
 * Compact card view of a member.
 * Used as an alternative to table rows on mobile devices.
 */
export function MemberCard({ member, onClick }: MemberCardProps) {
  const departmentName =
    typeof member.departmentId === 'object' ? member.departmentId.name : '—';
  const municipalityName =
    typeof member.municipalityId === 'object' ? member.municipalityId.name : '—';

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick?.(member)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{member.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {departmentName} / {municipalityName}
          </p>
        </div>
        <Badge variant={member.status === 'Activo' ? 'default' : 'secondary'}>
          {member.status}
        </Badge>
      </CardContent>
    </Card>
  );
}