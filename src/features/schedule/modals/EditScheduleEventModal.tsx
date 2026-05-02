import { useEffect } from 'react';
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
import { useUpdateScheduleEvent } from '../hooks/useUpdateScheduleEvent';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import type { ScheduleEvent } from '../types/schedule.types';

const schema = z.object({
  title: z.string().trim().optional(),
  allDayDate: z.string().optional(),
  description: z.string().trim().optional(),
  extras: z.string().trim().optional(),
  participants: z.array(z.string()).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent;
}

export function EditScheduleEventModal({ open, onOpenChange, event }: Props) {
  const updateMutation = useUpdateScheduleEvent();
  const { notifyUpdated } = useNotificationActions();

  // Ajuste: verificamos tanto participantsList como participants
  const getParticipantIds = () => {
    const list = event.participantsList || event.participants;
    if (!list) return [];
    return list.map((p: any) => (typeof p === 'string' ? p : p._id));
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event.title,
      allDayDate: event.allDayDate?.slice(0, 10) ?? '',
      description: event.description ?? '',
      extras: event.extras ?? '',
      participants: getParticipantIds(),
    },
  });

  useEffect(() => {
    form.reset({
      title: event.title,
      allDayDate: event.allDayDate?.slice(0, 10) ?? '',
      description: event.description ?? '',
      extras: event.extras ?? '',
      participants: getParticipantIds(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event._id, form]);

  const participants = form.watch('participants') ?? [];

const onSubmit = (values: z.infer<typeof schema>) => {
  
    const payload = {
      ...values,
      type: 'evento_cronograma', 
    };

    updateMutation.mutate(
      { id: event._id, data: payload },
      {
        onSuccess: () => {
          notifyUpdated('Evento de cronograma', values.title ?? event.title);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <FormModal
      key={event._id}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar evento de cronograma"
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
                <FormInput name="title" control={form.control} label="Título" />
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
                  label="Extras"
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