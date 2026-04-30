import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
//import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Sacrament } from '@/types';

interface SacramentCardProps {
  sacrament: Sacrament;
  onClick?: () => void;
}

export function SacramentCard({ sacrament, onClick }: SacramentCardProps) {
  const memberName =
    typeof sacrament.memberId === 'object' ? sacrament.memberId.fullName : '—';

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{sacrament.type}</p>
          <p className="text-sm text-muted-foreground truncate">{memberName}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(sacrament.date), 'dd/MM/yy', { locale: es })}
        </span>
      </CardContent>
    </Card>
  );
}