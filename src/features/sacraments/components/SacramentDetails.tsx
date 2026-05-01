import { BookOpen, Calendar, MapPin, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import type { Sacrament } from '@/types';

interface SacramentDetailsProps {
  sacrament: Sacrament;
}

export function SacramentDetails({ sacrament }: SacramentDetailsProps) {
  const memberName =
    typeof sacrament.memberId === 'object' ? sacrament.memberId.fullName : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">{sacrament.type}</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Detail icon={User} label="Miembro" value={memberName} />
       <Detail 
  icon={Calendar} 
  label="Fecha" 
  value={
    sacrament.date 
      ? format(new Date(sacrament.date.toString().slice(0, 10) + 'T12:00:00'), 'PPP', { locale: es }) 
      : '—'
  } 
/>
        {sacrament.place && <Detail icon={MapPin} label="Lugar" value={sacrament.place} />}
        <Detail icon={User} label="Celebrante" value={sacrament.celebrant || '—'} />
      </div>

      {sacrament.godparents.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Users className="h-4 w-4" /> Padrinos
            </h4>
            <div className="space-y-1">
              {sacrament.godparents.map((g, i) => (
                <div key={i} className="flex justify-between text-sm border-b pb-1 last:border-0">
                  <span>{g.name}</span>
                  <span className="text-muted-foreground">{g.role || 'Padrino/Madrina'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
    </div>
  );
}