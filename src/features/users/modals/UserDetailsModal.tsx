import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { User as UserType } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
}

export function UserDetailsModal({ open, onOpenChange, user }: Props) {
  if (!user) return null;

  const member = typeof user.memberId === 'object' ? user.memberId : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Details
          </DialogTitle>
          <DialogDescription>{'\u00A0'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── User info ──────────────────────────────────────────── */}
          <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h4>

            <Detail icon={User} label="Username" value={`@${user.username}`} />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant={user.role === 'Coordinador' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <Detail
              icon={Calendar}
              label="Created"
              value={new Date(user.createdAt).toLocaleDateString('es-HN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </div>

          {/* ── Member info (if linked) ─────────────────────────────── */}
          {member && (
            <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Linked Member
              </h4>

              <Detail icon={User} label="Name" value={member.fullName} />

              {member.phone && (
                <Detail icon={Phone} label="Phone" value={member.phone} />
              )}

              {member.email && (
                <Detail icon={Mail} label="Email" value={member.email} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}