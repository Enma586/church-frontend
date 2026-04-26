import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  ...buttonProps
}: FormSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting || disabled} 
      {...buttonProps}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSubmitting ? loadingLabel : (children ?? label)}
    </Button>
  );
}