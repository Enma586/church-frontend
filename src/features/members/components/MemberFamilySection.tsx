import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FamilyMember as FamilyMemberType } from '@/types';

interface MemberFamilySectionProps {
  family: FamilyMemberType[];
}

/**
 * Displays the family tree attached to a member profile.
 * Shows relationship, contact number, and whether the relative is also a church member.
 */
export function MemberFamilySection({ family }: MemberFamilySectionProps) {
  if (family.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        <Users className="mx-auto mb-2 h-6 w-6" />
        Sin familiares registrados
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Familia</h3>
      <div className="space-y-2">
        {family.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{f.name}</span>
              <span className="ml-2 text-muted-foreground">({f.relationship})</span>
            </div>
            <div className="flex items-center gap-2">
              {f.contactNumber && (
                <span className="text-xs text-muted-foreground">{f.contactNumber}</span>
              )}
              {f.isMember && (
                <Badge variant="outline" className="text-xs">
                  Miembro
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}