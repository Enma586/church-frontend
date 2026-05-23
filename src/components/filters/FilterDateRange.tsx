import { useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const handleDateFrom = useCallback((value: string) => {
    if (value && dateTo && value > dateTo) {
      onDateToChange(value);
    }
    if (value && !dateTo) {
      onDateToChange(value);
    }
    onDateFromChange(value);
  }, [dateTo, onDateFromChange, onDateToChange]);

  const handleDateTo = useCallback((value: string) => {
    if (value && dateFrom && value < dateFrom) {
      onDateFromChange(value);
    }
    if (value && !dateFrom) {
      onDateFromChange(value);
    }
    onDateToChange(value);
  }, [dateFrom, onDateFromChange, onDateToChange]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <DatePopover
          date={dateFrom}
          onChange={handleDateFrom}
          placeholder="Desde"
        />
        <span className="text-muted-foreground">–</span>
        <DatePopover
          date={dateTo}
          onChange={handleDateTo}
          placeholder="Hasta"
        />
      </div>
    </div>
  );
}

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
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
            "h-9 w-35 justify-start text-left font-normal bg-input text-sidebar-foreground hover:bg-input/80 dark:bg-input dark:hover:bg-input/80",
            !date && "text-sidebar-foreground/60",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(parseLocal(date), "PP", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ? parseLocal(date) : undefined}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  );
}
