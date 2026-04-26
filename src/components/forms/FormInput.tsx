import type { ComponentProps } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Usamos directamente ComponentProps<"input"> para alinear al 100% con shadcn
interface FormInputProps<T extends FieldValues>
  extends Omit<ComponentProps<"input">, 'name'> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...inputProps} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}