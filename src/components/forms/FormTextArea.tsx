import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { ComponentProps } from 'react';

interface FormTextAreaProps<T extends FieldValues>
  extends Omit<ComponentProps<"textarea">, 'name'> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
}
export function FormTextArea<T extends FieldValues>({
  name,
  control,
  label,
  ...textareaProps
}: FormTextAreaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...textareaProps} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}