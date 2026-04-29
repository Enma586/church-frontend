import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormSubmitButtonProps extends ComponentProps<typeof Button> {
  isSubmitting?: boolean;
  label?: string;
  loadingLabel?: string;
}

export function FormSubmitButton({
  isSubmitting = false,
  label = 'Guardar',
  loadingLabel = 'Guardando...',
  disabled,
  children,
  className, // 1. Extraemos className de las props
  ...buttonProps
}: FormSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting || disabled}
      // 2. Usamos cn() para agregar el hover y la transición sin romper otros estilos
      className={cn(
        "transition-colors duration-200 hover:bg-blue-600 hover:text-white", 
        className
      )}
      {...buttonProps}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSubmitting ? loadingLabel : (children ?? label)}
    </Button>
  );
}