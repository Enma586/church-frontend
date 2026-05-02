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
function parseLocal(value: string): Date {
  const datePart = value.split('T')[0];   // ← toma solo YYYY-MM-DD, ignora hora
  const [y, m, d] = datePart.split('-').map(Number);
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
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                    disabled && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(parseLocal(field.value), 'PPP', { locale: es })
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? parseLocal(field.value) : undefined}
                onSelect={(date) =>
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                }
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