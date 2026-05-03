/**
 * @fileoverview System configuration page.
 * Shows a read-only card with current settings and a button to edit.
 */
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditConfigModal } from '../modals/EditConfigModal';
import { useConfig } from '../hooks/useConfig';
import { Loader2 } from 'lucide-react';

export default function ConfigPage() {
  const { data: configData, isLoading, isError } = useConfig();
  const [editOpen, setEditOpen] = useState(false);

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
          <CardContent className="space-y-2 text-sm">
            <InfoRow
              label="Último backup"
              value={
                config.lastBackupDate
                  ? new Date(config.lastBackupDate).toLocaleString('es-HN')
                  : 'No realizado'
              }
            />
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