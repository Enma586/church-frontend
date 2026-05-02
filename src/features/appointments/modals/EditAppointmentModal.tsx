import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, FileText } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Separator } from '@/components/ui/separator';
import { useUpdateAppointment } from '../hooks/useUpdateAppointment';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { APPOINTMENT_STATUSES } from '@/constants/appointment-status';
import type { Appointment, UpdateAppointmentPayload } from '../types/appointment.types';
import { FormDateTimePicker } from '@/components/forms/FormDateTimePicker';

const statusOptions = APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s }));

const editSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  extras: z.string().trim().optional(),
  startDateTime: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
      <Icon className="h-5 w-5" />
      <h3 className="uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
}: Props) {
  const updateMutation = useUpdateAppointment();
  const { notifyUpdated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: appointment.title,
      description: appointment.description ?? '',
      extras: appointment.extras ?? '',
      startDateTime: appointment.startDateTime?.slice(0, 16) ?? '',
      status: appointment.status as typeof APPOINTMENT_STATUSES[number],
    },
  });

  useEffect(() => {
    form.reset({
      title: appointment.title,
      description: appointment.description ?? '',
      extras: appointment.extras ?? '',
      startDateTime: appointment.startDateTime?.slice(0, 16) ?? '',
      status: appointment.status as typeof APPOINTMENT_STATUSES[number],
    });
  }, [appointment._id, form]);

  const onSubmit = (values: z.infer<typeof editSchema>) => {
    const dirty: Record<string, unknown> = {};
    const keys = [
      'title',
      'description',
      'extras',
      'startDateTime',
      'status',
    ] as const;
    for (const k of keys)
      if (form.formState.dirtyFields[k]) dirty[k] = values[k];
    if (!Object.keys(dirty).length) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      { id: appointment._id, data: dirty as UpdateAppointmentPayload },
      {
        onSuccess: () => {
          notifyUpdated('Cita', values.title ?? appointment.title);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <FormModal
      key={appointment._id}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar cita"
      size="5xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={CalendarDays} title="Cita" />
                <FormInput
                  name="title"
                  control={form.control}
                  label="Título"
                />
                <FormTextArea
                  name="description"
                  control={form.control}
                  label="Descripción"
                  rows={3}
                />
                <FormSelect
                  name="status"
                  control={form.control}
                  label="Estado"
                  options={statusOptions}
                />
              </div>
           <div className="grid grid-cols-1 gap-4">
                  <FormDateTimePicker
                    name="startDateTime"
                    control={form.control}
                    label="Fecha y hora de inicio"
                  />
                </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Notas" />
                <FormTextArea
                  name="extras"
                  control={form.control}
                  label="Sugerencias / Observaciones"
                  rows={5}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <FormSubmitButton
              isSubmitting={updateMutation.isPending}
              label="Guardar cambios"
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}