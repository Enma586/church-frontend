import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FormDatePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
}

/**
 * Parses a YYYY-MM-DD string into a local Date (no timezone shift).
 *
 * @example parseLocal('2026-05-05') → Date representing May 5 at midnight LOCAL time
 */
function parseLocal(value: unknown): Date | null {
  if (!value) return null;
  const str = typeof value === 'string' ? value : String(value);
  const datePart = str.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  disabledDays,
}: FormDatePickerProps<T>) {
  const currentYear = new Date().getFullYear();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal bg-input text-sidebar-foreground hover:bg-input/80 dark:bg-input dark:hover:bg-input/80',
                    !field.value && 'text-sidebar-foreground/60',
                    disabled && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={disabled}
                >
                  {(() => {
                    const d = parseLocal(field.value);
                    return d ? format(d, 'PPP', { locale: es }) : <span>{placeholder}</span>;
                  })()}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseLocal(field.value) ?? undefined}
                onSelect={(date) => {
                  if (!date) {
                    field.onChange('');
                    return;
                  }
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  field.onChange(`${y}-${m}-${d}`);
                }}
                disabled={disabledDays}
                initialFocus
                locale={es}
                captionLayout="dropdown"
                fromYear={1920}
                toYear={currentYear + 5}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}