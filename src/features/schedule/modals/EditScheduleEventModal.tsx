import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, FileText } from 'lucide-react';
import { format } from 'date-fns';
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
import type { ScheduleEvent, UpdateScheduleEventPayload } from '../types/schedule.types';

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

const getSafeDate = (dateStr?: string) => {
  if (!dateStr) return '';
  if (dateStr.length === 10) return dateStr;
  if (dateStr.includes('T00:00:00')) return dateStr.slice(0, 10);
  return format(new Date(dateStr), 'yyyy-MM-dd');
};

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

export function EditScheduleEventModal({
  open,
  onOpenChange,
  event,
}: Props) {
  const updateMutation = useUpdateScheduleEvent();
  const { notifyUpdated } = useNotificationActions();

  const getParticipantIds = () => {
    const list = event.participantsList || event.participants;
    if (!list) return [];
    return list.map((p: any) => (typeof p === 'string' ? p : p._id));
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event.title,
      description: event.description ?? '',
      extras: event.extras ?? '',
      allDayDate: getSafeDate(event.allDayDate),
      participants: getParticipantIds(),
    },
  });

  useEffect(() => {
    form.reset({
      title: event.title,
      description: event.description ?? '',
      extras: event.extras ?? '',
      allDayDate: getSafeDate(event.allDayDate),
      participants: getParticipantIds(),
    });
  }, [event._id, form]);

  const participants = form.watch('participants') ?? [];

 const onSubmit = (values: z.infer<typeof schema>) => {
    const dirty: Record<string, unknown> = {};
    const keys = ['title', 'description', 'extras', 'allDayDate'] as const;
    
    for (const k of keys) {
      if (form.formState.dirtyFields[k]) dirty[k] = values[k];
    }
    
    if (form.formState.dirtyFields.participants) {
      dirty.participants = values.participants;
    }

    if (!Object.keys(dirty).length) {
      onOpenChange(false);
      return;
    }

    // Aplicamos el truco del mediodía solo si el usuario modificó la fecha
    if (dirty.allDayDate) {
      dirty.allDayDate = `${dirty.allDayDate}T12:00:00`;
    }

    // Aseguramos que el tipo no se pierda al enviar solo campos modificados
    dirty.type = 'evento_cronograma';

    updateMutation.mutate(
      { id: event._id, data: dirty as UpdateScheduleEventPayload },
      {
        onSuccess: () => {
          notifyUpdated('Evento', values.title ?? event.title);
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
                <SectionHeader icon={CalendarDays} title="Evento" />
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
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormDatePicker
                  name="allDayDate"
                  control={form.control}
                  label="Fecha del evento"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Notas" />
                <FormTextArea
                  name="extras"
                  control={form.control}
                  label="Presupuesto / Observaciones"
                  rows={4}
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