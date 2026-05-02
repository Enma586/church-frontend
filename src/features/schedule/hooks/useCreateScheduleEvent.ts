import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';
import type { CreateScheduleEventPayload } from '../types/schedule.types';

export function useCreateScheduleEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleEventPayload) => scheduleService.create(data),

    // 1. Se ejecuta al instante de darle a "Guardar", antes de que responda el servidor
    onMutate: async (newData) => {
      // Detenemos cualquier recarga automática que esté ocurriendo
      await qc.cancelQueries({ queryKey: ['schedule'] });

      // Guardamos la tabla actual en caso de que ocurra un error y debamos revertir
      const previousData = qc.getQueryData(['schedule']);

      // Actualizamos la tabla inyectando un evento temporal
      qc.setQueryData(['schedule'], (old: any) => {
        if (!old || !old.data) return old;

        // Creamos nuestro evento "fantasma" para engañar a la vista
        const optimisticEvent = {
          _id: `temp-${Date.now()}`, // ID falso temporal
          ...newData,
          // Rellenamos los participantes con un texto genérico mientras el servidor hace el populate real
          participantsList: newData.participants?.map((id) => ({ 
            _id: id, 
            fullName: 'Guardando...' 
          })) || []
        };

        return {
          ...old,
          // Ponemos el nuevo evento de primero en la lista
          data: [optimisticEvent, ...old.data],
        };
      });

      return { previousData };
    },

    // 2. Si el servidor falla, regresamos la tabla a la normalidad
    onError: (e: Error, _variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(['schedule'], context.previousData);
      }
      showToast.error(e.message);
    },

    // 3. Si todo va bien, mostramos el éxito
    onSuccess: () => {
      showToast.success('Evento creado con éxito');
    },

    // 4. Pase lo que pase, refrescamos en segundo plano para obtener el _id real de Mongo
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}