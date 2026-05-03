/**
 * @fileoverview Modal wrapper for the ConfigForm component.
 * Loads the current configuration and delegates editing to ConfigForm.
 */
import { FormModal } from '@/components/modals/FormModal';
import { ConfigForm } from '../components/ConfigForm';
import { useConfig } from '../hooks/useConfig';
import { Loader2 } from 'lucide-react';

interface EditConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditConfigModal({ open, onOpenChange }: EditConfigModalProps) {
  const { data: configData, isLoading, isError } = useConfig();

  const config = configData?.data;

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Configuración del sistema"
      description="Modifica los parámetros generales de la aplicación."
      size="2xl"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="text-center text-sm text-destructive py-6">
          Error al cargar la configuración. Intenta de nuevo.
        </p>
      )}

      {config && <ConfigForm config={config} />}
    </FormModal>
  );
}