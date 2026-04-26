import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FilterDateRangeProps {
  label: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function FilterDateRange({
  label,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: FilterDateRangeProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <DatePopover
          date={dateFrom}
          onChange={onDateFromChange}
          placeholder="Desde"
        />
        <span className="text-muted-foreground">–</span>
        <DatePopover
          date={dateTo}
          onChange={onDateToChange}
          placeholder="Hasta"
        />
      </div>
    </div>
  );
}

function DatePopover({
  date,
  onChange,
  placeholder,
}: {
  date: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 w-35 justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(new Date(date), 'PP', { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : undefined}
          onSelect={(d) => onChange(d?.toISOString() ?? '')}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}