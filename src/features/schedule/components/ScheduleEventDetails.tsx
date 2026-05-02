import { CalendarDays, Users, FileText, MessageSquare, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Asegúrate de ajustar la ruta de importación de SyncStatusBadge si es necesario
import { SyncStatusBadge } from '@/features/appointments/components/SyncStatusBadge';
import type { ScheduleEvent } from '../types/schedule.types';

export function ScheduleEventDetails({ event }: { event: ScheduleEvent }) {
  // Búsqueda inteligente para el creador
  const creatorData = event.creatorId || event.createdBy;
  const creatorName = (typeof creatorData === 'object' && creatorData !== null && 'username' in creatorData)
    ? `@${creatorData.username}` 
    : '—';

  // Soporte para los encargados
  const participants = event.participantsList || event.participants || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold leading-tight">{event.title}</h2>
          {event.syncStatus && <SyncStatusBadge status={event.syncStatus} />}
        </div>
      </div>

      <Separator />

      {/* GRID de datos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail icon={UserCircle} label="Creado por" value={creatorName} />
        {event.allDayDate && (
          <Detail 
            icon={CalendarDays} 
            label="Fecha" 
            value={format(new Date(event.allDayDate), "EEEE d 'de' MMMM, yyyy", { locale: es })} 
          />
        )}
      </div>

      <Separator />

      {/* ENCARGADOS (Mostrados como Badges) */}
      {participants.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Encargados del Evento
          </span>
          <div className="flex flex-wrap gap-2">
            {participants.map((p: any) => (
              <Badge key={p._id || p} variant="secondary" className="px-3 py-1 font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
                {p.fullName || `ID: ${p.substring(0,4)}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* SECCIONES de texto */}
      <div className="space-y-4">
        {event.description && (
          <Section icon={FileText} title="Descripción" content={event.description} />
        )}
        {event.extras && (
          <Section icon={MessageSquare} title="Notas" content={event.extras} />
        )}
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="flex flex-col">
        <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-medium capitalize-first">{value}</span>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="bg-muted/20 p-4 rounded-lg">
      <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}