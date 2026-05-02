import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { showToast } from '@/lib/toast';

export function useDeleteScheduleEvent() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => scheduleService.remove(id),
    
    // 1. Esto se ejecuta AL INSTANTE de darle al botón "Eliminar", antes de hablar con el servidor
    onMutate: async (id) => {
      // Cancelamos cualquier actualización automática de la tabla en curso
      await qc.cancelQueries({ queryKey: ['schedule'] });

      // Guardamos la lista como estaba antes (por si hay que revertir el error)
      const previousData = qc.getQueryData(['schedule']);

      // Eliminamos el evento de la memoria local de inmediato
      qc.setQueryData(['schedule'], (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((event: any) => event._id !== id),
        };
      });

      // Retornamos el estado anterior para que lo pueda usar onError si es necesario
      return { previousData };
    },
    
    // 2. Si el servidor dice que hubo un error, restauramos la tabla a como estaba
    onError: (e: Error, _id, context) => {
      if (context?.previousData) {
        qc.setQueryData(['schedule'], context.previousData);
      }
      showToast.error(e.message);
    },
    
    // 3. Si todo sale bien en el servidor, mostramos el mensaje de éxito
    onSuccess: () => {
      showToast.success('Evento eliminado');
    },
    
    // 4. Pase lo que pase, obligamos a React Query a sincronizar silenciosamente en segundo plano
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}