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
  title: z.string().trim().min(1, 'Required'),
  allDayDate: z.string().min(1, 'Required'),
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
      notifyCreated('Schedule event', values.title);
      form.reset();
      onOpenChange(false);
    } catch {}
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="New schedule event"
      description="Add an activity to the annual church calendar."
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
                <SectionHeader icon={CalendarDays} title="Event details" />
                <FormInput
                  name="title"
                  control={form.control}
                  label="Title"
                  placeholder="Youth Retreat"
                />
                <FormDatePicker
                  name="allDayDate"
                  control={form.control}
                  label="Event date"
                />
                <FormTextArea
                  name="description"
                  control={form.control}
                  label="Description"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Notes" />
                <FormTextArea
                  name="extras"
                  control={form.control}
                  label="Extras / Budget"
                  rows={3}
                />
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <SectionHeader icon={FileText} title="Assigned members" />
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
              label="Create event"
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