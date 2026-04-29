import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  // 1. Ampliamos las opciones de tamaño disponibles
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

// 2. Agregamos las clases reales de Tailwind para pantallas anchas
const sizeMap = {
  sm: 'sm:max-w-sm',       // 384px
  md: 'sm:max-w-md',       // 448px
  lg: 'sm:max-w-lg',       // 512px
  xl: 'sm:max-w-xl',       // 576px
  '2xl': 'sm:max-w-2xl',   // 672px
  '3xl': 'sm:max-w-3xl',   // 768px
  '4xl': 'sm:max-w-4xl',   // 896px (Perfecto para 2 columnas)
  '5xl': 'sm:max-w-5xl',   // 1024px
};

/**
 * Wrapper dialog for forms.
 * Always renders a DialogDescription (non‑breaking space when empty)
 * to satisfy the shadcn accessibility requirement.
 */
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Añadimos w-[95vw] para que en celulares no toque los bordes de la pantalla */}
      <DialogContent
        className={cn('w-[95vw] max-h-[90vh] overflow-y-auto', sizeMap[size])}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? '\u00A0'}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}