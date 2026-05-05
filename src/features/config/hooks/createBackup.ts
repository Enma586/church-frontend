/**
 * @fileoverview React Query hooks para gestionar los respaldos del sistema.
 */
import { useMutation } from '@tanstack/react-query';
import { configService } from '../services/config.service'; // Ajusta la ruta según tu estructura
import { showToast } from '@/lib/toast';

/**
 * Descarga el respaldo como un archivo .zip al equipo local.
 */
export function useDownloadBackup() {
  return useMutation({
    mutationFn: () => configService.downloadBackup(),
    onSuccess: (blobData) => {
      // Crear URL temporal para el archivo binario
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      
      // Asignar nombre y forzar la descarga
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `respaldo_parroquia_${date}.zip`);
      
      document.body.appendChild(link);
      link.click();
      
      // Limpiar el DOM y la memoria
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast.success('Respaldo descargado con éxito');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Error al descargar el respaldo');
    },
  });
}

/**
 * Ordena al servidor crear y guardar un respaldo internamente.
 * La actualización de la fecha se manejará vía Sockets.
 */
export function useTriggerBackup() {
  return useMutation({
    mutationFn: () => configService.triggerBackup(),
    onSuccess: () => {
      // Solo avisamos el inicio; el Socket avisará cuando termine
      showToast.success('Creando respaldo en el servidor...');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Error al iniciar el respaldo');
    },
  });
}