import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MemberFamilySection } from './MemberFamilySection';
import type { Member } from '@/types';

interface MemberDetailsProps {
  member: Member;
}

/**
 * Read‑only detail view shown inside the member profile page
 * and as content in the edit/create modals.
 */
export function MemberDetails({ member }: MemberDetailsProps) {
  const departmentName =
    member.departmentId && typeof member.departmentId === 'object' ? member.departmentId.name : '—';
  const municipalityName =
    member.municipalityId && typeof member.municipalityId === 'object' ? member.municipalityId.name : '—';

  // Helper para formatear fechas evitando el desfase de zona horaria (UTC issue)
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return '—';
    try {
      const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toISOString();
      return dateString.split('T')[0].split('-').reverse().join('/');
    } catch (error) {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{member.fullName}</h2>
          <p className="text-sm text-muted-foreground">
            Miembro desde {formatDate(member.createdAt)}
          </p>
        </div>
        <Badge variant={member.status === 'Activo' ? 'default' : 'secondary'} className="text-sm">
          {member.status}
        </Badge>
      </div>

      <Separator />

      {/* ── Personal info ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem icon={Calendar} label="Fecha de nacimiento">
          {formatDate(member.dateOfBirth)}
        </DetailItem>
        <DetailItem icon={MapPin} label="Género">
          {member.gender}
        </DetailItem>
        {member.phone && (
          <DetailItem icon={Phone} label="Teléfono">
            {member.phone}
          </DetailItem>
        )}
        {member.email && (
          <DetailItem icon={Mail} label="Correo">
            {member.email}
          </DetailItem>
        )}
      </div>

      {/* ── Address ────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Dirección</h3>
        <p className="text-sm">
          {departmentName} / {municipalityName}
        </p>
        {member.addressDetails && (
          <p className="text-sm text-muted-foreground">{member.addressDetails}</p>
        )}
      </div>

      <Separator />

      {/* ── Family ─────────────────────────────────────────────────── */}
      <MemberFamilySection family={member.family} />
    </div>
  );
}

/** Small icon‑and‑label row used inside the details grid. */
function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span>{children}</span>
    </div>
  );
}