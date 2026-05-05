/**
 * @fileoverview System configuration page.
 * Shows a read-only card with current settings and a button to edit.
 */
import { useState } from 'react';
import { Pencil, Loader2, Database, Download } from 'lucide-react'; // Añadido Download
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditConfigModal } from '../modals/EditConfigModal';
import { useConfig } from '../hooks/useConfig';
import { useTriggerBackup, useDownloadBackup } from '../hooks/createBackup'; // Importamos ambos hooks

export default function ConfigPage() {
  const { data: configData, isLoading, isError } = useConfig();
  const [editOpen, setEditOpen] = useState(false);
  
  // Hook para disparar el backup internamente en el servidor
  const { mutate: triggerBackup, isPending: isCreatingBackup } = useTriggerBackup();
  
  // Hook para forzar la descarga del ZIP a la computadora
  const { mutate: downloadBackup, isPending: isDownloadingBackup } = useDownloadBackup();

  const config = configData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No se pudo cargar la configuración. Verifica que el backend esté
            funcionando y que exista un documento de configuración.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Parámetros generales del sistema.
          </p>
        </div>
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ── Iglesia ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Iglesia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Nombre" value={config.churchName} />
          </CardContent>
        </Card>

        {/* ── Google Calendar ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Calendar ID" value={config.googleCalendarId} />
            <InfoRow
              label="Service Account"
              value={config.googleServiceAccountEmail ?? 'No configurado'}
            />
          </CardContent>
        </Card>

        {/* ── Notificaciones ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Notificaciones locales
              </span>
              <Badge
                variant={
                  config.enableLocalNotifications ? 'default' : 'secondary'
                }
              >
                {config.enableLocalNotifications ? 'Activadas' : 'Desactivadas'}
              </Badge>
            </div>
            <InfoRow
              label="Intervalo"
              value={`${config.notificationRefreshInterval}s`}
            />
          </CardContent>
        </Card>

        {/* ── Respaldo ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Respaldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoRow
              label="Último backup"
              value={
                config.lastBackupDate
                  ? new Date(config.lastBackupDate).toLocaleString('es-SV')
                  : 'No realizado'
              }
            />
            
            {/* ── Botones ordenados ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 mt-2 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => triggerBackup()}
                disabled={isCreatingBackup || isDownloadingBackup}
              >
                {isCreatingBackup ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                {isCreatingBackup ? 'Creando...' : 'Guardar en servidor'}
              </Button>

              <Button
                variant="default"
                className="w-full"
                onClick={() => downloadBackup()}
                disabled={isCreatingBackup || isDownloadingBackup}
              >
                {isDownloadingBackup ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloadingBackup ? 'Descargando...' : 'Descargar a PC'}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      <EditConfigModal open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

/** Simple label-value row for read-only config display */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right ml-2 truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}