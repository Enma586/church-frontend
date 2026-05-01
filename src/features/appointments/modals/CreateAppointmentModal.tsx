import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, FileText } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Separator } from '@/components/ui/separator';
import { useCreateAppointment } from '../hooks/useCreateAppointment';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import type { CreateAppointmentPayload } from '../types/appointment.types';
//import { APPOINTMENT_STATUSES } from '@/constants/appointment-status';

//const statusOptions = APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s }));

const createSchema = z.object({
  memberId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Selecciona un miembro'),
  title: z.string().trim().min(1, 'Requerido'),
  description: z.string().trim().optional(),
  extras: z.string().trim().optional(),
  startDateTime: z.string().min(1, 'Requerida'),
  endDateTime: z.string().min(1, 'Requerida'),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CreateAppointmentModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateAppointment();
  const { notifyCreated } = useNotificationActions();
  const { data: membersData } = useMembers({ limit: 100 });
  const members = membersData?.data ?? [];

  const memberOptions = members.map((m) => ({ value: m._id, label: m.fullName }));

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      memberId: '',
      title: '',
      description: '',
      extras: '',
      startDateTime: '',
      endDateTime: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof createSchema>) => {
    try {
      await createMutation.mutateAsync({
        type: 'cita_pastoral',
        ...values,
      } as CreateAppointmentPayload);
      notifyCreated('Cita', values.title);
      form.reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva cita pastoral"
      description="Agenda una reunión con un miembro."
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
                <FormSelect
                  name="memberId"
                  control={form.control}
                  label="Miembro"
                  options={memberOptions}
                  placeholder="Seleccionar..."
                />
                <FormInput name="title" control={form.control} label="Título" />
                <FormTextArea
                  name="description"
                  control={form.control}
                  label="Descripción"
                  rows={3}
                />
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={CalendarDays} title="Horario" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormDatePicker
                    name="startDateTime"
                    control={form.control}
                    label="Inicio"
                  />
                  <FormDatePicker
                    name="endDateTime"
                    control={form.control}
                    label="Fin"
                  />
                </div>
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
              isSubmitting={createMutation.isPending}
              label="Crear cita"
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}