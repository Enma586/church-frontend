import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  placeholder?: string;
  className?: string;   // Agregado: para personalizar anchos o bordes si se requiere
  disabled?: boolean;   // Agregado: para poder bloquear el selector
}

/**
 * Controlled select integrated with react‑hook‑form.
 * Uses `value` (not `defaultValue`) so the UI stays synced with form state.
 */
export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Seleccionar...',
  className,
  disabled = false,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value ?? ''}
            disabled={disabled} // Le pasamos el estado disabled al Select nativo
          >
            <FormControl>
              <SelectTrigger className={cn("transition-colors focus:ring-2", className)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}