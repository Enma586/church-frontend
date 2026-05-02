import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ date, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-50 text-center capitalize">
          {format(date, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={onToday}>
        Hoy
      </Button>
    </div>
  );
}