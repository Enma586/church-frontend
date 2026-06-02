import { useCallback } from "react";
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

function parseLocal(value: unknown): Date | null {
  if (!value) return null;
  const [y, m, d] = String(value).split("T")[0].split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const y = d.getUTCFullYear();
  return `${day}/${m}/${y}`;
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
          {(() => {
            if (!date) return placeholder;
            const d = parseLocal(date);
            if (!d) return placeholder;
            return formatDisplay(d);
          })()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={parseLocal(date) ?? undefined}
          onSelect={(d) => onChange(d ? toDateString(d) : "")}
          timeZone="UTC"
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  );
}
