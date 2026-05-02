import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, FileText } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormModal } from '@/components/modals/FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { FormTextArea } from '@/components/forms/FormTextArea';
import { FormSubmitButton } from '@/components/forms/FormSubmitButton';
import { Separator } from '@/components/ui/separator';
import { MultiMemberSelect } from '../components/MultiMemberSelect';
import { useCreateScheduleEvent } from '../hooks/useCreateScheduleEvent';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import type { CreateScheduleEventPayload } from '../types/schedule.types';

const schema = z.object({
  title: z.string().trim().min(1, 'Requerido'),
  allDayDate: z.string().min(1, 'Requerido'),
  description: z.string().trim().optional(),
  extras: z.string().trim().optional(),
  participants: z.array(z.string()).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateScheduleEventModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateScheduleEvent();
  const { notifyCreated } = useNotificationActions();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      allDayDate: '',
      description: '',
      extras: '',
      participants: [] as string[],
    },
  });

  const participants = form.watch('participants') ?? [];

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createMutation.mutateAsync({
        type: 'evento_cronograma',
        ...values,
        participants: values.participants ?? [],
      } as CreateScheduleEventPayload);
      notifyCreated('Evento de cronograma', values.title);
      form.reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo evento de cronograma"
      description="Añade una actividad o evento general al calendario anual."
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
                <SectionHeader icon={CalendarDays} title="Detalle del evento" />
                <FormInput
                  name="title"
                  control={form.control}
                  label="Título"
                  placeholder="Ej. Retiro de Jóvenes"
                />
                <FormDatePicker
                  name="allDayDate"
                  control={form.control}
                  label="Día del evento"
                />
                <FormTextArea
                  name="description"
                  control={form.control}
                  label="Descripción"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Notas" />
                <FormTextArea
                  name="extras"
                  control={form.control}
                  label="Extras / Presupuesto"
                  rows={3}
                />
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Miembros asignados" />
                <MultiMemberSelect
                  value={participants}
                  onChange={(ids) =>
                    form.setValue('participants', ids, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <FormSubmitButton
              isSubmitting={createMutation.isPending}
              label="Crear evento"
              className="w-full sm:w-auto px-8"
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
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