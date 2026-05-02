import { CalendarDays, User, FileText, MessageSquare, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SyncStatusBadge } from './SyncStatusBadge';
import type { Appointment } from '../types/appointment.types';

export function AppointmentDetails({ appointment }: { appointment: Appointment }) {
  const memberData = appointment.member || (typeof appointment.memberId === 'object' ? appointment.memberId : null);
  const memberName = memberData?.fullName ?? null;

  const participantList = appointment.participantsList ?? [];

  const creatorData = appointment.creatorId || appointment.createdBy;
  const creatorName = (typeof creatorData === 'object' && creatorData !== null && 'username' in creatorData)
    ? `@${creatorData.username}`
    : '—';

  const isSchedule = appointment.type === 'evento_cronograma';
  const dateLabel = isSchedule ? 'Fecha' : 'Fecha y Hora';
  const dateValue = isSchedule
    ? appointment.allDayDate
      ? format(new Date(appointment.allDayDate), 'PPP', { locale: es })
      : '—'
    : appointment.startDateTime
      ? format(new Date(appointment.startDateTime), "PPP 'a las' p", { locale: es })
      : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold leading-tight">{appointment.title}</h2>
          <Badge variant={appointment.status === 'Programada' ? 'default' : appointment.status === 'Completada' ? 'secondary' : 'destructive'}>
            {appointment.status}
          </Badge>
        </div>
        <SyncStatusBadge status={appointment.syncStatus} />
      </div>

      <Separator />

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail icon={CalendarDays} label={dateLabel} value={dateValue} />
        <Detail icon={Clock} label="Creada por" value={creatorName} />

        {/* Member (cita_pastoral) */}
        {!isSchedule && memberName && (
          <Detail icon={User} label="Miembro" value={memberName} />
        )}
      </div>

      {/* Participants (evento_cronograma) */}
      {isSchedule && participantList.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3">
              <Users className="h-4 w-4" />
              <span className="uppercase tracking-wider">Encargados</span>
            </h4>
            <div className="space-y-2">
              {participantList.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{p.fullName}</span>
                  {p.phone && (
                    <span className="text-xs text-muted-foreground">{p.phone}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Text sections */}
      <div className="space-y-4">
        {appointment.description && (
          <Section icon={FileText} title="Descripción" content={appointment.description} />
        )}
        {appointment.extras && (
          <Section icon={MessageSquare} title="Observaciones" content={appointment.extras} />
        )}
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="flex flex-col">
        <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, content }: { icon: React.ComponentType<{ className?: string }>; title: string; content: string }) {
  return (
    <div className="bg-muted/20 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}