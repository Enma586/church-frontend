/**
 * @fileoverview Form component for editing system configuration.
 * Provides inputs for church name, Google Calendar integration,
 * notification settings, and backup info.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/FormInput';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { useUpdateConfig } from '../hooks/useConfig';
import type { Configuration } from '@/types';
import { Separator } from '@/components/ui/separator';

const configSchema = z.object({
  churchName: z.string().min(1, 'El nombre de la iglesia es requerido'),
  googleCalendarId: z.string().min(1, 'El ID del calendario es requerido'),
  googleServiceAccountEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  notificationRefreshInterval: z.coerce
    .number()
    .min(10, 'Mínimo 10 segundos')
    .max(3600, 'Máximo 3600 segundos'),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigFormProps {
  config: Configuration;
}

export function ConfigForm({ config }: ConfigFormProps) {
  const updateConfig = useUpdateConfig();

  const form = useForm<ConfigFormValues>({
    // El "as any" resuelve el conflicto estricto entre Zod coerce y React Hook Form
    resolver: zodResolver(configSchema) as any,
    defaultValues: {
      churchName: config.churchName,
      googleCalendarId: config.googleCalendarId,
      googleServiceAccountEmail: config.googleServiceAccountEmail ?? '',
      notificationRefreshInterval: config.notificationRefreshInterval,
    },
  });

  const onSubmit = (values: ConfigFormValues) => {
    updateConfig.mutate({
      ...values,
      googleServiceAccountEmail: values.googleServiceAccountEmail || undefined,
    } as any);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* ── Iglesia ── */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Información de la Iglesia
          </h3>
          <FormInput
            name="churchName"
            control={form.control}
            label="Nombre de la iglesia"
            placeholder="Parroquia Local"
          />
        </div>

        <Separator />

        {/* ── Google Calendar ── */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Google Calendar
          </h3>
          <FormInput
            name="googleCalendarId"
            control={form.control}
            label="ID del calendario"
            placeholder="primary"
          />
          <FormInput
            name="googleServiceAccountEmail"
            control={form.control}
            label="Email de cuenta de servicio"
            placeholder="service-account@project.iam.gserviceaccount.com"
          />
        </div>

        <Separator />

        {/* ── Notificaciones ── */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Notificaciones
          </h3>
          <FormInput
            name="notificationRefreshInterval"
            control={form.control}
            label="Intervalo de verificación (segundos)"
            type="number"
          />
        </div>

        <Separator />

        {/* ── Último backup (readonly) ── */}
        {config.lastBackupDate && (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Respaldo
            </h3>
            <p className="text-sm">
              Último backup:{' '}
              <span className="font-medium">
                {/* Cambiado a es-SV para usar el formato de El Salvador */}
                {new Date(config.lastBackupDate).toLocaleString('es-SV')}
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <FormSubmitButton
            isSubmitting={updateConfig.isPending}
            label="Guardar configuración"
            loadingLabel="Guardando..."
            className="px-8"
          />
        </div>
      </form>
    </Form>
  );
}