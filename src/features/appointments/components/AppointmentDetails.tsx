import {
  CalendarDays,
  Clock,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { SyncStatusBadge } from './SyncStatusBadge';
import type { Appointment } from '../types/appointment.types';

export function AppointmentDetails({
  appointment,
}: {
  appointment: Appointment;
}) {
  const memberName = appointment.member?.fullName ?? '—';
  const creatorName = appointment.creator
    ? `@${appointment.creator.username}`
    : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{appointment.title}</h2>
        <Badge
          variant={
            appointment.status === 'Programada'
              ? 'default'
              : appointment.status === 'Completada'
                ? 'secondary'
                : 'destructive'
          }
        >
          {appointment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Detail icon={User} label="Miembro" value={memberName} />
        {appointment.startDateTime && (
          <Detail
            icon={CalendarDays}
            label="Inicio"
            value={format(new Date(appointment.startDateTime), 'PPP p', {
              locale: es,
            })}
          />
        )}
        {appointment.endDateTime && (
          <Detail
            icon={Clock}
            label="Fin"
            value={format(new Date(appointment.endDateTime), 'PPP p', {
              locale: es,
            })}
          />
        )}
        <Detail icon={User} label="Creada por" value={creatorName} />
      </div>

      <SyncStatusBadge status={appointment.syncStatus} />

      {appointment.description && (
        <Section
          icon={FileText}
          title="Descripción"
          content={appointment.description}
        />
      )}
      {appointment.extras && (
        <Section
          icon={MessageSquare}
          title="Observaciones"
          content={appointment.extras}
        />
      )}
    </div>
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
      <span>{value}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
}) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-semibold mb-1">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}