import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';
import type { UpdateScheduleEventPayload } from '../types/schedule.types';

export function useUpdateScheduleEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleEventPayload;
    }) => scheduleService.update(id, data),

    // 1. Se ejecuta al instante al darle "Guardar cambios"
    onMutate: async ({ id, data }) => {
      // Cancelamos recargas pendientes
      await qc.cancelQueries({ queryKey: ['schedule'] });

      // Guardamos la versión anterior de la tabla por si falla
      const previousData = qc.getQueryData(['schedule']);

      // Actualizamos solo la fila editada en la memoria local
      qc.setQueryData(['schedule'], (old: any) => {
        if (!old || !old.data) return old;

        return {
          ...old,
          data: old.data.map((event: any) =>
            // Si es el evento que editamos, fusionamos lo viejo con lo nuevo
            event._id === id ? { ...event, ...data } : event
          ),
        };
      });

      return { previousData };
    },

    // 2. Si el servidor rechaza el cambio, regresamos al estado anterior
    onError: (e: Error, _variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(['schedule'], context.previousData);
      }
      showToast.error(e.message);
    },

    // 3. Confirmación visual de éxito
    onSuccess: () => {
      showToast.success('Evento actualizado exitosamente');
    },

    // 4. Sincronización en segundo plano (muy importante aquí para traer los nombres reales de los participantes si los cambiaste)
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}