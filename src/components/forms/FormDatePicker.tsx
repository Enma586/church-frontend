import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Para que los meses salgan en español
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
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Seleccionar fecha',
  disabled = false,
}: FormDatePickerProps<T>) {
  // Calculamos el año actual para no permitir fechas del futuro (ej. nacer en 2027)
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
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(new Date(field.value), 'PPP', { locale: es })
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
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  // Guardamos la fecha en formato ISO para la base de datos
                  field.onChange(date ? date.toISOString() : '');
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                initialFocus
                locale={es} // Calendario en español
                
                // 🪄 AQUÍ ESTÁ LA MAGIA PARA LA NAVEGACIÓN RÁPIDA 🪄
                captionLayout="dropdown"
                fromYear={1920}
                toYear={currentYear}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}